import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  Users,
  ChevronRight,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    clients,
    tasks,
    updateTaskStatus,
    setSelectedClientId,
    setActiveTab,
  } = useCRM();

  // Employee's assigned clients
  const myClients = (clients || []).filter((c) => c && ((c.assignedEmployeeIds && c.assignedEmployeeIds.includes(currentUser?.id)) || c.assignedAdminId === currentUser?.id || c.assignedEmployeeId === currentUser?.id));
  const myTasks = (tasks || []).filter((t) => t && (t.assignedEmployeeId === currentUser?.id || (t.assignedEmployeeIds && t.assignedEmployeeIds.includes(currentUser?.id))));
  const pendingTasks = (myTasks || []).filter((t) => t && t.status !== 'completed' && t.status !== 'cancelled');

  // Rejected / Action required documents
  const actionRequiredClients = (myClients || []).filter(
    (c) =>
      c &&
      (c.currentStageId === 'stage-11' ||
        c.currentStageId === 'stage-5' ||
        c.currentStageId === 'stage-4')
  );

  return (
    <div className="space-y-6">
      {/* 4-Column Geometric Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            My Assigned Clients
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {myClients.length}
            </span>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded">
              Active Cases
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Pending Tasks
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-purple-600">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-purple-600 font-bold bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded">
              Action Required
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Document Actions
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-amber-600">
              {actionRequiredClients.length}
            </span>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded">
              Files Needed
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Completed Tasks
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-600">
              {myTasks.filter((t) => t.status === 'completed').length}
            </span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded">
              Done
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 8 Cols Left + 4 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: My Assigned Clients Queue */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-widest">
                  My Active Client Cases
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('clients')}
                className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View Full List</span>
                <span>→</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {(myClients || []).map((client) => {
                    const activeSrv = client?.services?.[0];
                    return (
                      <tr
                        key={client.id}
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setActiveTab('clients');
                        }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{client.fullName}</p>
                          <p className="text-[11px] font-mono text-slate-400">{client.refNo}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                          {activeSrv?.serviceName || 'No service attached'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                            {client.currentStageName}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-blue-600 text-xs font-bold hover:underline">Open Dossier →</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Today's Tasks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-widest">
                My Action Tasks
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                {pendingTasks.length} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {myTasks.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">No tasks currently assigned to you.</div>
              ) : (
                myTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-md border transition-all ${
                      task.status === 'completed'
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-70'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() =>
                            updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')
                          }
                          className={`mt-0.5 rounded p-0.5 transition-colors cursor-pointer ${
                            task.status === 'completed' ? 'text-emerald-600' : 'text-slate-400 hover:text-blue-600'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              task.status === 'completed'
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">For: {task.clientName || 'General'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pl-6">
                      <span>Due: {task.dueDate}</span>
                      <span className="capitalize px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase text-[9px]">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
