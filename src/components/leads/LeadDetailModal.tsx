import React, { useState, useMemo } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Building2,
  Briefcase,
  MapPin,
  Globe,
  Compass,
  CheckSquare,
  Plus,
  Trash2,
  Send,
  Shield,
  Clock,
  UserCheck,
  Tag,
  Sparkles,
  ArrowRight,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, TaskItem, InternalNote } from '../../types/crm';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onOpenEdit?: (lead: Lead) => void;
  onOpenConvert?: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onOpenEdit,
  onOpenConvert,
}) => {
  const {
    users,
    tasks,
    updateLead,
    deleteLead,
    addLeadTask,
    updateTaskStatus,
    deleteTask,
    addLeadNote,
    deleteLeadNote,
    currentUser,
    companies,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'notes'>('overview');

  // Task Creation State
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskItem['priority']>('medium');
  const [taskDueDate, setTaskDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [taskAssigneeId, setTaskAssigneeId] = useState(
    lead.assignedEmployeeId || currentUser.id
  );

  // Note Creation State
  const [noteText, setNoteText] = useState('');
  const [noteChannel, setNoteChannel] = useState<'internal' | 'whatsapp' | 'email'>('internal');
  const [taggedUserId, setTaggedUserId] = useState('');

  const activeEmployees = useMemo(() => {
    return (users || []).filter((u) => u && (u.role === 'employee' || u.role === 'admin' || u.role === 'master'));
  }, [users]);

  // Tasks linked to this lead
  const leadTasks = useMemo(() => {
    return (tasks || []).filter((t) => t && t.leadId === lead.id);
  }, [tasks, lead.id]);

  const completedTasksCount = (leadTasks || []).filter((t) => t && t.status === 'completed').length;
  const pendingTasksCount = (leadTasks || []).filter((t) => t && t.status !== 'completed' && t.status !== 'cancelled').length;

  // Notes list (with fallback to legacy string notes)
  const notesList: InternalNote[] = useMemo(() => {
    if (lead.notesList && lead.notesList.length > 0) {
      return lead.notesList;
    }
    if (lead.notes) {
      return [
        {
          id: `legacy-${lead.id}`,
          userId: lead.assignedEmployeeId || 'system',
          userName: lead.assignedEmployeeName || 'Case Officer',
          userRole: 'employee',
          text: lead.notes,
          type: 'internal',
          createdAt: lead.createdAt,
        },
      ];
    }
    return [];
  }, [lead]);

  const assignedCompany = companies.find((c) => c.id === lead.companyId);

  // Status Change Handler
  const handleStatusChange = (newStatus: Lead['status']) => {
    updateLead(lead.id, { status: newStatus });
  };

  // Add Task Handler
  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const assignee = users.find((u) => u.id === taskAssigneeId);

    addLeadTask(lead.id, {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      assignedEmployeeId: taskAssigneeId,
      assignedEmployeeName: assignee?.name || 'Staff',
      assignedEmployeeAvatar: assignee?.avatar,
      priority: taskPriority,
      status: 'pending',
      dueDate: taskDueDate,
      leadId: lead.id,
      leadName: lead.name,
    });

    setTaskTitle('');
    setTaskDescription('');
    setShowAddTaskForm(false);
  };

  // Quick Preset Tasks
  const handleAddPresetTask = (title: string, priority: TaskItem['priority'] = 'medium') => {
    const assignee = users.find((u) => u.id === (lead.assignedEmployeeId || currentUser.id));
    addLeadTask(lead.id, {
      title,
      description: `Action item for lead ${lead.name} (${lead.refNo})`,
      assignedEmployeeId: lead.assignedEmployeeId || currentUser.id,
      assignedEmployeeName: assignee?.name || 'Staff',
      assignedEmployeeAvatar: assignee?.avatar,
      priority,
      status: 'pending',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      leadId: lead.id,
      leadName: lead.name,
    });
  };

  // Note Submission Handler
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const tagged = taggedUserId ? [taggedUserId] : [];

    if (noteChannel === 'whatsapp') {
      const cleanPhone = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');
      const textToEncode = `Hello ${lead.name},\n\nRegarding your inquiry (${lead.serviceInterested || 'PRO Services'} - Ref: ${lead.refNo}) with ADCS CRM:\n\n${noteText.trim()}\n\nBest regards,\n${currentUser.name}\nADCS Business Services`;
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textToEncode)}`;

      // Open WhatsApp in new window
      window.open(waUrl, '_blank');

      // Record note in CRM
      addLeadNote(lead.id, noteText.trim(), 'client_message', 'whatsapp', tagged);
    } else if (noteChannel === 'email') {
      const email = lead.email;
      const subject = `Update Regarding Your Inquiry [Ref: ${lead.refNo}] - ADCS CRM`;
      const body = `Dear ${lead.name},\n\n${noteText.trim()}\n\nBest regards,\n${currentUser.name}\nADCS Business Services`;
      const mailtoUrl = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.open(mailtoUrl, '_blank');

      addLeadNote(lead.id, noteText.trim(), 'client_message', 'email', tagged);
    } else {
      // Internal Note
      addLeadNote(lead.id, noteText.trim(), 'internal', 'system', tagged);
    }

    setNoteText('');
    setTaggedUserId('');
  };

  const getPriorityBadge = (p: Lead['priority']) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  const getStatusBadge = (s: Lead['status']) => {
    switch (s) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300';
      case 'contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300';
      case 'proposal_sent':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300';
      case 'negotiation':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300';
      case 'converted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'lost':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {lead.refNo}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getPriorityBadge(lead.priority)}`}>
                {lead.priority} Priority
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(lead.status)}`}>
                {lead.status.replace('_', ' ')}
              </span>
              {assignedCompany && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{assignedCompany.name}</span>
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{lead.name}</span>
              {lead.companyName && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  &bull; {lead.companyName}
                </span>
              )}
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {lead.serviceInterested || lead.category || 'General PRO Clearance'}
              </span>
              <span>&bull;</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Est: AED {(lead.estimatedValue || 0).toLocaleString()}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {lead.status !== 'converted' && (
              <button
                onClick={() => onOpenConvert(lead)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                title="Convert to Active Client"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Convert to Client</span>
              </button>
            )}
            <button
              onClick={() => onOpenEdit(lead)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Edit Lead Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action / Contact Quick Bar */}
        <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-xl font-medium flex items-center gap-1.5 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-mono">{lead.phone}</span>
            </a>
            <a
              href={`https://wa.me/${(lead.whatsapp || lead.phone).replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl font-medium flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp Chat</span>
            </a>
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 rounded-xl font-medium flex items-center gap-1.5 transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-purple-500" />
                <span>{lead.email}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Stage:</span>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 capitalize text-slate-800 dark:text-slate-200"
            >
              <option value="new">1. New Inquiry</option>
              <option value="contacted">2. Contacted</option>
              <option value="proposal_sent">3. Proposal Sent</option>
              <option value="negotiation">4. In Negotiation</option>
              <option value="converted">5. Converted Client</option>
              <option value="lost">6. Lost / Disqualified</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lead Profile & Location</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>To-Do List & Tasks</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              pendingTasksCount > 0
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {leadTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Record & Send Notes</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {notesList.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 bg-white dark:bg-slate-900">
          {/* TAB 1: OVERVIEW & LOCATION */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Job Type / Role Banner */}
              {(lead.jobType || lead.jobTitleInterest || lead.isJobLead) && (
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
                        Job Type / Applied Role
                      </div>
                      <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                        {lead.jobType || lead.jobTitleInterest || 'Candidate Application'}
                      </h4>
                      {lead.jobExperienceYears && (
                        <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                          Experience / Background: {lead.jobExperienceYears}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                    Recruitment Track
                  </span>
                </div>
              )}

              {/* Location & Demographics Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Geography & Location Intelligence</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium">Gender</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      {lead.gender || 'Male'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium">Country / Nationality</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {lead.country || lead.nationality || 'United Arab Emirates'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium">City / Municipality</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      {lead.city || 'Dubai'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-medium">Current Physical Location</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-500" />
                      {lead.currentLocation || 'Inside UAE (Dubai)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service & Operational Assignment Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Inquiry Classification</span>
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Service:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{lead.serviceInterested}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Category:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Inbound Channel:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{lead.source}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Estimated Value:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        AED {(lead.estimatedValue || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Registered By:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {lead.createdByName || 'Admin'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Case Ownership & Officers</span>
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 shrink-0">Assigned Staff:</span>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {(lead.assignedEmployeeNames && lead.assignedEmployeeNames.length > 0) ? (
                          lead.assignedEmployeeNames.map((name, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded text-[11px] font-bold"
                            >
                              {name}
                            </span>
                          ))
                        ) : lead.assignedEmployeeName ? (
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded text-[11px] font-bold">
                            {lead.assignedEmployeeName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Branch Office:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {assignedCompany?.name || 'Main HQ'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Next Follow-Up:</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {lead.followUpDate || 'Not Scheduled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Created:</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS & TO-DO LIST */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Task Header & Quick Presets */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
                <div>
                  <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    <span>Lead Action Items & Follow-up Checklist</span>
                  </h4>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                    {completedTasksCount} of {leadTasks.length} tasks completed &bull; {pendingTasksCount} pending action
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddTaskForm ? 'Cancel Task' : 'Add To-Do Item'}</span>
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Action Presets
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddPresetTask('Request Passport & Emirates ID scan copy', 'high')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    + Request Passport / ID Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTask('Send formal quotation & service scope via WhatsApp', 'high')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    + Send WhatsApp Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTask('Schedule consultation / document review call', 'medium')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    + Schedule Review Call
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetTask('Follow up on trade license & MOA clearance', 'medium')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    + Trade License Follow-up
                  </button>
                </div>
              </div>

              {/* Add Custom Task Form */}
              {showAddTaskForm && (
                <form
                  onSubmit={handleCreateTaskSubmit}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in"
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Create To-Do Item for {lead.name}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Call client regarding golden visa property valuation certificate"
                      className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-300 dark:border-slate-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Instructions / Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      placeholder="Additional guidance for the assignee..."
                      className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-300 dark:border-slate-600"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Assignee
                      </label>
                      <select
                        value={taskAssigneeId}
                        onChange={(e) => setTaskAssigneeId(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-300 dark:border-slate-600"
                      >
                        {activeEmployees.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name} ({e.title || e.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Priority
                      </label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as any)}
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-300 dark:border-slate-600"
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-300 dark:border-slate-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTaskForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-2.5">
                {leadTasks.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      No tasks or to-do items logged for this lead yet.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Use the quick presets above to assign follow-up tasks to your team.
                    </p>
                  </div>
                ) : (
                  leadTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        task.status === 'completed'
                          ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70'
                          : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateTaskStatus(
                              task.id,
                              task.status === 'completed' ? 'pending' : 'completed'
                            )
                          }
                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                            task.status === 'completed'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                          }`}
                        >
                          {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs font-bold ${
                                task.status === 'completed'
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                task.priority === 'urgent'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : task.priority === 'high'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                            <span>Assigned: <strong className="text-slate-600 dark:text-slate-300">{task.assignedEmployeeName}</strong></span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Due: {task.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RECORD & SEND NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Note Composer */}
              <form
                onSubmit={handleAddNoteSubmit}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Log Remarks or Send Direct Note to Client</span>
                  </span>

                  {/* Channel Selector */}
                  <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-700/60 p-0.5 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setNoteChannel('internal')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        noteChannel === 'internal'
                          ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Internal Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteChannel('whatsapp')}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        noteChannel === 'whatsapp'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp Note</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteChannel('email')}
                      className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        noteChannel === 'email'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email Note</span>
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={
                    noteChannel === 'whatsapp'
                      ? `Type message to send to ${lead.name} via WhatsApp (${lead.whatsapp || lead.phone})...`
                      : noteChannel === 'email'
                      ? `Type email body to send to ${lead.name} (${lead.email || 'No email registered'})...`
                      : 'Type internal PRO remark, government query feedback, or next-step memo...'
                  }
                  className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <select
                      value={taggedUserId}
                      onChange={(e) => setTaggedUserId(e.target.value)}
                      className="p-1.5 bg-white dark:bg-slate-800 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Tag Officer (optional)</option>
                      {activeEmployees.map((u) => (
                        <option key={u.id} value={u.id}>
                          @{u.name} ({u.title || u.role})
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] text-slate-400">
                      Author: <strong className="text-slate-700 dark:text-slate-300">{currentUser.name}</strong>
                    </span>
                  </div>

                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                      noteChannel === 'whatsapp'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                        : noteChannel === 'email'
                        ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {noteChannel === 'whatsapp'
                        ? 'Launch WhatsApp & Log Note'
                        : noteChannel === 'email'
                        ? 'Compose Email & Log Note'
                        : 'Post Internal Note'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Notes Timeline List */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Notes & Communications History ({notesList.length})
                </div>

                {notesList.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                    No notes recorded yet. Add your first internal note or WhatsApp interaction above.
                  </div>
                ) : (
                  notesList.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center">
                            {note.userName ? note.userName[0] : 'U'}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{note.userName}</span>
                          <span className="text-[10px] text-slate-400 capitalize">({note.userRole || 'Staff'})</span>

                          {/* Channel Badge */}
                          {note.sentVia === 'whatsapp' ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                              <MessageSquare className="w-2.5 h-2.5" /> WhatsApp Sent
                            </span>
                          ) : note.sentVia === 'email' ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" /> Email Sent
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                              <Shield className="w-2.5 h-2.5" /> Internal Memo
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(note.createdAt).toLocaleDateString()}{' '}
                            {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {(currentUser.role === 'master' || currentUser.role === 'admin' || currentUser.id === note.userId) && (
                            <button
                              type="button"
                              onClick={() => deleteLeadNote(lead.id, note.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-8">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Assigned Branch: <strong>{assignedCompany?.name || 'ADCS Main HQ'}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
