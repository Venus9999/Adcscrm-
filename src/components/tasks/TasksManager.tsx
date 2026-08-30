import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  Search,
  Building2,
  X,
  Bell,
  Send,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Task } from '../../types/crm';

export const TasksManager: React.FC = () => {
  const {
    filteredTasks,
    users,
    clients,
    companies,
    addTask,
    updateTaskStatus,
    currentUser,
    selectedCompanyId,
    selectedEmployeeId,
    taskDueReminders,
    triggerTaskReminderNotification,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dueFilter, setDueFilter] = useState<'all' | 'overdue' | 'due_today' | 'due_soon'>('all');
  const [employeeFilter, setEmployeeFilter] = useState(selectedEmployeeId || 'all');
  const [companyFilter, setCompanyFilter] = useState(selectedCompanyId || 'all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCompanyId) setCompanyFilter(selectedCompanyId);
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedEmployeeId) setEmployeeFilter(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedEmployeeId: (users || []).find((u) => u && u.role === 'employee')?.id || users?.[0]?.id || '',
    clientId: (clients || [])[0]?.id || '',
    priority: 'medium' as Task['priority'],
    dueDate: new Date().toISOString().split('T')[0],
  });

  const companyMap = useMemo(() => {
    const map = new Map<string, string>();
    companies.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [companies]);

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => map.set(u.id, u.name));
    return map;
  }, [users]);

  // Map task IDs to due reminders
  const taskReminderMap = useMemo(() => {
    const map = new Map<string, (typeof taskDueReminders)[0]>();
    (taskDueReminders || []).forEach((r) => map.set(r.taskId, r));
    return map;
  }, [taskDueReminders]);

  const overdueCount = useMemo(() => (taskDueReminders || []).filter((r) => r.isOverdue).length, [taskDueReminders]);
  const dueTodayCount = useMemo(() => (taskDueReminders || []).filter((r) => r.isDueToday).length, [taskDueReminders]);
  const dueSoonCount = useMemo(() => (taskDueReminders || []).filter((r) => r.dueStatus === 'due_soon').length, [taskDueReminders]);

  const displayTasks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (filteredTasks || []).filter((t) => {
      if (!t) return false;
      const empName = (userMap.get(t.assignedEmployeeId) || t.assignedEmployeeName || '').toLowerCase();
      const compName = t.companyId ? (companyMap.get(t.companyId) || '').toLowerCase() : '';
      const clientName = (t.clientName || '').toLowerCase();
      const title = (t.title || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();

      const matchSearch =
        !q ||
        title.includes(q) ||
        desc.includes(q) ||
        clientName.includes(q) ||
        empName.includes(q) ||
        compName.includes(q);

      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchEmployee = employeeFilter === 'all' || t.assignedEmployeeId === employeeFilter;
      const matchCompany = companyFilter === 'all' || t.companyId === companyFilter;

      let matchDue = true;
      if (dueFilter !== 'all') {
        const reminder = taskReminderMap.get(t.id);
        if (!reminder) {
          matchDue = false;
        } else if (dueFilter === 'overdue') {
          matchDue = reminder.isOverdue;
        } else if (dueFilter === 'due_today') {
          matchDue = reminder.isDueToday;
        } else if (dueFilter === 'due_soon') {
          matchDue = reminder.dueStatus === 'due_soon';
        }
      }

      return matchSearch && matchStatus && matchPriority && matchEmployee && matchCompany && matchDue;
    });
  }, [filteredTasks, searchQuery, statusFilter, priorityFilter, employeeFilter, companyFilter, dueFilter, companyMap, userMap, taskReminderMap]);

  const handleSendReminder = (taskId: string, title: string) => {
    triggerTaskReminderNotification(taskId);
    setReminderToast(`Sent priority reminder for "${title}"`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const assignedEmp = users.find((u) => u.id === formData.assignedEmployeeId);
    const linkedClient = clients.find((c) => c.id === formData.clientId);

    addTask({
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignedEmployeeId: formData.assignedEmployeeId,
      assignedEmployeeName: assignedEmp?.name || 'Staff',
      clientId: formData.clientId || undefined,
      clientName: linkedClient?.fullName || undefined,
      priority: formData.priority,
      status: 'pending',
      dueDate: formData.dueDate,
    });

    setShowAddModal(false);
    setFormData({
      title: '',
      description: '',
      assignedEmployeeId: (users || []).find((u) => u && u.role === 'employee')?.id || users?.[0]?.id || '',
      clientId: (clients || [])[0]?.id || '',
      priority: 'medium',
      dueDate: '2026-03-01',
    });
  };

  const branchEmployees = (users || []).filter((u) => u && (u.role === 'employee' || u.role === 'admin'));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in slide-in-from-top-2 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tasks & Follow-up Scheduler</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign operations action items, biometric bookings, medical follow-ups, and document collection
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Task Due Reminders Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setDueFilter('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            dueFilter === 'all'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{filteredTasks.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">All active & assigned work</p>
        </button>

        <button
          onClick={() => setDueFilter(dueFilter === 'overdue' ? 'all' : 'overdue')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            dueFilter === 'overdue'
              ? 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-700 ring-2 ring-red-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-tight">Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-xl font-extrabold text-red-600 dark:text-red-400 mt-1">{overdueCount}</p>
          <p className="text-[10px] text-red-500/80 mt-0.5">Immediate follow-up required</p>
        </button>

        <button
          onClick={() => setDueFilter(dueFilter === 'due_today' ? 'all' : 'due_today')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            dueFilter === 'due_today'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-tight">Due Today</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{dueTodayCount}</p>
          <p className="text-[10px] text-amber-500/80 mt-0.5">Must be finalized today</p>
        </button>

        <button
          onClick={() => setDueFilter(dueFilter === 'due_soon' ? 'all' : 'due_soon')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            dueFilter === 'due_soon'
              ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 ring-2 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-tight">Due Next 3 Days</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{dueSoonCount}</p>
          <p className="text-[10px] text-purple-500/80 mt-0.5">Upcoming deadlines</p>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, client, employee, branch..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {(searchQuery ||
              statusFilter !== 'all' ||
              priorityFilter !== 'all' ||
              dueFilter !== 'all' ||
              employeeFilter !== 'all' ||
              companyFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setDueFilter('all');
                  setEmployeeFilter('all');
                  setCompanyFilter('all');
                }}
                className="px-2.5 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-[11px] font-bold hover:bg-rose-100 transition-colors flex items-center gap-1"
              >
                <span>Reset Filters</span>
              </button>
            )}
            <span className="text-[11px] font-semibold text-slate-500">
              Showing {displayTasks.length} of {filteredTasks.length} tasks
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          {/* Branch / Company */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value="all">All Branches</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Employee */}
          {currentUser.role !== 'employee' && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium max-w-[170px]"
            >
              <option value="all">All Employees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayTasks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">No tasks match the filter.</div>
        ) : (
          displayTasks.map((task) => {
            const reminder = taskReminderMap.get(task.id);
            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  task.status === 'completed'
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-70'
                    : reminder?.isOverdue
                    ? 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10 shadow-xs'
                    : reminder?.isDueToday
                    ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {task.priority} Priority
                      </span>

                      {reminder && task.status !== 'completed' && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            reminder.isOverdue
                              ? 'bg-red-600 text-white'
                              : reminder.isDueToday
                              ? 'bg-amber-500 text-white'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          <span>{reminder.dueStatus.replace('_', ' ')}</span>
                        </span>
                      )}
                    </div>

                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                      className="text-[10px] font-semibold p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 capitalize"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <h3
                    className={`font-bold text-xs mt-3 ${
                      task.status === 'completed'
                        ? 'line-through text-slate-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">{task.description}</p>
                  {task.clientName && (
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-2">
                      Client: {task.clientName}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-slate-500">Assigned: {task.assignedEmployeeName}</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300 text-[11px]">Due: {task.dueDate}</span>
                  </div>

                  {task.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => handleSendReminder(task.id, task.title)}
                      className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-amber-200/60 dark:border-amber-800/40"
                      title="Dispatch task reminder notification"
                    >
                      <Bell className="w-3 h-3" />
                      <span>Remind</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule VIP Medical Fitness Slot"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Task Instructions / Details
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assignee *
                  </label>
                  <select
                    value={formData.assignedEmployeeId}
                    onChange={(e) => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    {branchEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Linked Client
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="">None (Internal)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
