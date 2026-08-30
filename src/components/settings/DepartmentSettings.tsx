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
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Department } from '../../types/crm';

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
    currentUser.role === 'admin' ||
    currentUser.role === 'employee' ||
    Boolean(currentUser.permissions?.canManageSystemSettings);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    companyId: companies[0]?.id || '',
    description: '',
    headOfDepartment: '',
    budget: 50000,
    isActive: true,
    tagsInput: 'Operations, Core',
  });

  const filteredDepts = (departments || []).filter((d) => {
    if (!d) return false;
    const matchesSearch =
      (d.name && d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.code && d.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.headOfDepartment && d.headOfDepartment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCompany =
      selectedCompanyFilter === 'all' || !d.companyId || d.companyId === selectedCompanyFilter;

    return Boolean(matchesSearch && matchesCompany);
  });

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: `DEP-${Math.floor(100 + Math.random() * 900)}`,
      companyId: companies[0]?.id || '',
      description: '',
      headOfDepartment: users.find((u) => u.role === 'admin')?.name || '',
      budget: 50000,
      isActive: true,
      tagsInput: 'Operations, Core',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      companyId: dept.companyId || companies[0]?.id || '',
      description: dept.description || '',
      headOfDepartment: dept.headOfDepartment || '',
      budget: dept.budget || 0,
      isActive: dept.isActive,
      tagsInput: dept.tags ? dept.tags.join(', ') : '',
    });
    setShowModal(true);
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

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        companyId: formData.companyId,
        description: formData.description.trim(),
        headOfDepartment: formData.headOfDepartment.trim(),
        budget: Number(formData.budget) || 0,
        isActive: formData.isActive,
        tags,
      });

      setNotice({ type: 'success', text: `Department "${formData.name}" updated successfully.` });
      setShowModal(false);
      setTimeout(() => setNotice(null), 3000);
    } else {
      addDepartment({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase() || `DEP-${Date.now().toString().slice(-4)}`,
        companyId: formData.companyId,
        description: formData.description.trim(),
        headOfDepartment: formData.headOfDepartment.trim(),
        budget: Number(formData.budget) || 0,
        isActive: formData.isActive,
        tags,
      });

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
            className="text-xs font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Department Management</h2>
              <p className="text-xs text-slate-400">
                Organize organizational divisions, assign department heads, and allocate operational budgets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments by name, code, head, or tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-all"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white focus:outline-hidden focus:border-blue-500 transition-all font-medium"
          >
            <option value="all">All Companies & Branches ({companies.length})</option>
            {companies.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          const linkedCompany = (companies || []).find((c) => c && c.id === dept.companyId);
          const deptEmployees = (users || []).filter((u) => u && u.companyId === dept.companyId && u.role === 'employee');

          return (
            <div
              key={dept.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
                      {dept.code.slice(0, 4)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{dept.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 mt-0.5 inline-block">
                        {dept.code}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
                  {dept.description || 'No specific description provided for this operational unit.'}
                </p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Branch / Entity</span>
                    <span className="font-semibold text-slate-300 truncate block">
                      {linkedCompany?.name || 'All Entities'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Head of Dept</span>
                    <span className="font-semibold text-slate-300 truncate block">
                      {dept.headOfDepartment || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Budget (AED)</span>
                    <span className="font-semibold text-emerald-400">
                      AED {(dept.budget || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Active Team</span>
                    <span className="font-semibold text-blue-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {deptEmployees.length} Staff
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {dept.tags && dept.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dept.tags.map((tag, idx) => (
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
              {canManage && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditModal(dept)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    title="Edit Department"
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
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredDepts.length === 0 && (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">No Departments Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No organizational departments match your current query or company filter.
            </p>
            {canManage && (
              <button
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Department</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingDept ? 'Edit Department' : 'Create New Department'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure organizational division & assign company branch
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
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
                    Department Code *
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
                    Assigned Company / Entity
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-blue-500"
                  >
                    {companies.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Head of Department
                  </label>
                  <input
                    type="text"
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Operational Budget (AED)
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

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded-sm bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-300">Active Department</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Description & Operational Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the department's mandate and primary responsibilities..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  placeholder="e.g. ICP, Visas, Golden Visa, Clearance"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
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
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDepartment(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20"
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
