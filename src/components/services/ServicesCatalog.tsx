import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  FileCheck2,
  CheckCircle2,
  X,
  Search,
  AlertTriangle,
  FolderPlus,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ServiceCategory } from '../../types/crm';

const CATEGORIES = [
  'All',
  'Visa Processing',
  'Business Setup',
  'Document Clearing',
  'PRO Services',
  'Legal Attestation',
  'Translation',
];

export const ServicesCatalog: React.FC = () => {
  const {
    serviceCategories,
    addServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    currentUser,
    stages,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCategory | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Visa Processing' as ServiceCategory['category'],
    defaultPrice: 3500,
    governmentFees: 1800,
    estimatedDays: 7,
    description: '',
    requiredDocuments: ['Valid Passport Copy', 'High-Resolution Photo'],
    defaultStages: ['stage-1', 'stage-2', 'stage-4', 'stage-7', 'stage-9', 'stage-10', 'stage-12', 'stage-13', 'stage-14'],
  });

  const [newDocInput, setNewDocInput] = useState('');

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      code: `SRV-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Visa Processing',
      defaultPrice: 3500,
      governmentFees: 1800,
      estimatedDays: 7,
      description: '',
      requiredDocuments: ['Valid Passport Copy', 'High-Resolution Photo'],
      defaultStages: ['stage-1', 'stage-2', 'stage-4', 'stage-7', 'stage-9', 'stage-10', 'stage-12', 'stage-13', 'stage-14'],
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (service: ServiceCategory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingService(service);
    setFormData({
      name: service.name,
      code: service.code,
      category: service.category,
      defaultPrice: service.defaultPrice,
      governmentFees: service.governmentFees,
      estimatedDays: service.estimatedDays,
      description: service.description,
      requiredDocuments: [...service.requiredDocuments],
      defaultStages: [...service.defaultStages],
    });
    setShowAddModal(true);
  };

  const handleAddDocumentItem = () => {
    if (!newDocInput.trim()) return;
    if (!formData.requiredDocuments.includes(newDocInput.trim())) {
      setFormData({
        ...formData,
        requiredDocuments: [...formData.requiredDocuments, newDocInput.trim()],
      });
    }
    setNewDocInput('');
  };

  const handleRemoveDocumentItem = (index: number) => {
    setFormData({
      ...formData,
      requiredDocuments: formData.requiredDocuments.filter((_, idx) => idx !== index),
    });
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Please fill in service name and code.');
      return;
    }

    if (editingService) {
      updateServiceCategory(editingService.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        defaultPrice: Number(formData.defaultPrice),
        governmentFees: Number(formData.governmentFees),
        estimatedDays: Number(formData.estimatedDays),
        description: formData.description.trim(),
        requiredDocuments: formData.requiredDocuments,
        defaultStages: formData.defaultStages,
      });
      if (selectedService?.id === editingService.id) {
        setSelectedService({
          ...editingService,
          ...formData,
          defaultPrice: Number(formData.defaultPrice),
          governmentFees: Number(formData.governmentFees),
          estimatedDays: Number(formData.estimatedDays),
        });
      }
    } else {
      addServiceCategory({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        defaultPrice: Number(formData.defaultPrice),
        governmentFees: Number(formData.governmentFees),
        estimatedDays: Number(formData.estimatedDays),
        description: formData.description.trim(),
        requiredDocuments: formData.requiredDocuments,
        defaultStages: formData.defaultStages,
      });
    }

    setShowAddModal(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingServiceId) return;
    deleteServiceCategory(deletingServiceId);
    if (selectedService?.id === deletingServiceId) {
      setSelectedService(null);
    }
    setDeletingServiceId(null);
  };

  const displayServices = serviceCategories.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryTab === 'All' || s.category === selectedCategoryTab;

    return matchesSearch && matchesCategory;
  });

  const canManage = currentUser.role === 'master' || currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Services Catalog & Authority Fees</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardized visa tiers, document clearance packages, and government fee schedules
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service or code..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-hidden"
            />
          </div>

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Service</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {CATEGORIES.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedCategoryTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedCategoryTab === tab
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayServices.map((srv) => (
          <div
            key={srv.id}
            onClick={() => setSelectedService(srv)}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {srv.code}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">{srv.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    {srv.estimatedDays} Days SLA
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        title="Edit Service"
                        onClick={(e) => handleOpenEditModal(srv, e)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete Service"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingServiceId(srv.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">{srv.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{srv.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Professional Service Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    AED {srv.defaultPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Gov Pass-through Fee:</span>
                  <span className="font-bold text-blue-600 font-mono">
                    AED {srv.governmentFees.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Package:</span>
                  <span className="text-emerald-600 font-mono">
                    AED {(srv.defaultPrice + srv.governmentFees).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                Mandatory Documents ({srv.requiredDocuments.length}):
              </span>
              <div className="flex flex-wrap gap-1">
                {srv.requiredDocuments.slice(0, 3).map((doc, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[120px]"
                  >
                    {doc}
                  </span>
                ))}
                {srv.requiredDocuments.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                    +{srv.requiredDocuments.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayServices.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Services Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or create a new service.</p>
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedService.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedService.code} &bull; {selectedService.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedService(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">{selectedService.description}</p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    AED {selectedService.defaultPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Government Fees:</span>
                  <span className="font-bold text-blue-600 font-mono">
                    AED {selectedService.governmentFees.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated SLA Duration:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedService.estimatedDays} business days
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Total Client Invoice:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    AED {(selectedService.defaultPrice + selectedService.governmentFees).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Mandatory Required Client Documents ({selectedService.requiredDocuments.length}):
                </h4>
                <ul className="space-y-1.5 pl-2">
                  {selectedService.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(selectedService)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Service</span>
                    </button>
                    <button
                      onClick={() => setDeletingServiceId(selectedService.id)}
                      className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-xl font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingService ? 'Edit Service Catalog' : 'Create New Service Package'}
                  </h2>
                  <p className="text-xs text-slate-500">Configure pricing, government fees, and mandatory documents</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. 5-Year Green Residence Visa"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Service Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. GV-5Y-GREEN"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category Classification</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory['category'] })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Visa Processing">Visa Processing</option>
                    <option value="Business Setup">Business Setup</option>
                    <option value="Document Clearing">Document Clearing</option>
                    <option value="PRO Services">PRO Services</option>
                    <option value="Legal Attestation">Legal Attestation</option>
                    <option value="Translation">Translation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated SLA Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Service Fee (AED) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Government Fees (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.governmentFees}
                    onChange={(e) => setFormData({ ...formData, governmentFees: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Service Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of process, authorities involved, and clearance milestones..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Required Documents List */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Required Client Documents Checklist
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newDocInput}
                    onChange={(e) => setNewDocInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDocumentItem();
                      }
                    }}
                    placeholder="Add document item (e.g. Attested Degree, Ejari Tenancy)..."
                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocumentItem}
                    className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  {formData.requiredDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{doc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocumentItem(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {formData.requiredDocuments.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">No required documents added yet.</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  {editingService ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingServiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Service Category</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to remove this service from the active catalog? Existing client dossiers already using this service will maintain their historical records.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingServiceId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
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
