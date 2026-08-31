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
  Building2,
  Users,
  Percent,
  Sparkles,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ServiceCategory } from '../../types/crm';

const DEFAULT_CATEGORIES = [
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
    setActiveTab,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [pricingTierFilter, setPricingTierFilter] = useState<'all' | 'b2c' | 'b2b'>('all');
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);

  // Dynamic category tabs
  const allCategories = React.useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    (serviceCategories || []).forEach((s) => {
      if (s && s.category) set.add(s.category);
    });
    return ['All', ...Array.from(set)];
  }, [serviceCategories]);

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
    priceB2C: 3500,
    priceB2B: 2975,
    b2bDiscountPercent: 15,
    pricingTierAvailable: 'all' as 'all' | 'b2b_only' | 'b2c_only',
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
      priceB2C: 3500,
      priceB2B: 2975,
      b2bDiscountPercent: 15,
      pricingTierAvailable: 'all',
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
    const b2c = service.priceB2C !== undefined ? service.priceB2C : service.defaultPrice;
    const b2b = service.priceB2B !== undefined ? service.priceB2B : Math.round(b2c * 0.8);
    const disc = service.b2bDiscountPercent !== undefined 
      ? service.b2bDiscountPercent 
      : (b2c > 0 ? Math.round(((b2c - b2b) / b2c) * 100) : 15);

    setFormData({
      name: service.name,
      code: service.code,
      category: service.category,
      defaultPrice: b2c,
      priceB2C: b2c,
      priceB2B: b2b,
      b2bDiscountPercent: disc,
      pricingTierAvailable: service.pricingTierAvailable || 'all',
      governmentFees: service.governmentFees,
      estimatedDays: service.estimatedDays,
      description: service.description,
      requiredDocuments: [...service.requiredDocuments],
      defaultStages: [...service.defaultStages],
    });
    setShowAddModal(true);
  };

  const handleB2CChange = (newB2C: number) => {
    const disc = formData.b2bDiscountPercent || 0;
    const calculatedB2B = Math.max(0, Math.round(newB2C * (1 - disc / 100)));
    setFormData((prev) => ({
      ...prev,
      priceB2C: newB2C,
      defaultPrice: newB2C,
      priceB2B: calculatedB2B,
    }));
  };

  const handleDiscountPercentChange = (newPercent: number) => {
    const b2c = formData.priceB2C || formData.defaultPrice || 0;
    const calculatedB2B = Math.max(0, Math.round(b2c * (1 - newPercent / 100)));
    setFormData((prev) => ({
      ...prev,
      b2bDiscountPercent: newPercent,
      priceB2B: calculatedB2B,
    }));
  };

  const handleB2BChange = (newB2B: number) => {
    const b2c = formData.priceB2C || formData.defaultPrice || 0;
    const disc = b2c > 0 ? Math.max(0, Math.min(100, Math.round(((b2c - newB2B) / b2c) * 100))) : 0;
    setFormData((prev) => ({
      ...prev,
      priceB2B: newB2B,
      b2bDiscountPercent: disc,
    }));
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
      requiredDocuments: (formData.requiredDocuments || []).filter((_, idx) => idx !== index),
    });
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Please fill in service name and code.');
      return;
    }

    const b2cPrice = Number(formData.priceB2C) || Number(formData.defaultPrice);
    const b2bPrice = Number(formData.priceB2B) || Math.round(b2cPrice * 0.85);
    const b2bDisc = Number(formData.b2bDiscountPercent) || (b2cPrice > 0 ? Math.round(((b2cPrice - b2bPrice) / b2cPrice) * 100) : 15);

    if (editingService) {
      updateServiceCategory(editingService.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        defaultPrice: b2cPrice,
        priceB2C: b2cPrice,
        priceB2B: b2bPrice,
        b2bDiscountPercent: b2bDisc,
        pricingTierAvailable: formData.pricingTierAvailable,
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
          defaultPrice: b2cPrice,
          priceB2C: b2cPrice,
          priceB2B: b2bPrice,
          b2bDiscountPercent: b2bDisc,
          pricingTierAvailable: formData.pricingTierAvailable,
          governmentFees: Number(formData.governmentFees),
          estimatedDays: Number(formData.estimatedDays),
        });
      }
    } else {
      addServiceCategory({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        defaultPrice: b2cPrice,
        priceB2C: b2cPrice,
        priceB2B: b2bPrice,
        b2bDiscountPercent: b2bDisc,
        pricingTierAvailable: formData.pricingTierAvailable,
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

  const displayServices = (serviceCategories || []).filter((s) => {
    if (!s) return false;
    const matchesSearch =
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategoryTab === 'All' || s.category === selectedCategoryTab;

    const matchesTier =
      pricingTierFilter === 'all' ||
      (pricingTierFilter === 'b2c' && (s.pricingTierAvailable === 'all' || s.pricingTierAvailable === 'b2c_only' || !s.pricingTierAvailable)) ||
      (pricingTierFilter === 'b2b' && (s.pricingTierAvailable === 'all' || s.pricingTierAvailable === 'b2b_only' || !s.pricingTierAvailable));

    return Boolean(matchesSearch && matchesCategory && matchesTier);
  });

  const canManageCategories = currentUser.role === 'master' || currentUser.role === 'admin';
  const canManageDepartments = currentUser.role === 'master' || currentUser.role === 'admin';
  const canManage = currentUser.role === 'master' || currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Services Catalog & Tiered Pricing</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
              B2B & B2C Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage B2C retail rates, B2B corporate partner discounts, and government pass-through fee schedules
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search service, code or description..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-hidden"
            />
          </div>

          {(canManageCategories || canManageDepartments || canManage) && (
            <div className="flex items-center gap-2">
              {canManageCategories && (
                <button
                  onClick={() => setActiveTab('categories')}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  title="Manage Lead Categories, Channels & Stages"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Categories & Stages</span>
                </button>
              )}
              {canManageDepartments && (
                <button
                  onClick={() => setActiveTab('departments')}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  title="Manage Departments"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Departments</span>
                </button>
              )}
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
          )}
        </div>
      </div>

      {/* Pricing Tier & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {allCategories.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedCategoryTab(tab)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedCategoryTab === tab
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Pricing Tier Switch */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setPricingTierFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              pricingTierFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Tiers
          </button>
          <button
            type="button"
            onClick={() => setPricingTierFilter('b2c')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
              pricingTierFilter === 'b2c'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>B2C Retail</span>
          </button>
          <button
            type="button"
            onClick={() => setPricingTierFilter('b2b')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
              pricingTierFilter === 'b2b'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>B2B Corporate</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayServices.map((srv) => {
          const b2c = srv.priceB2C !== undefined ? srv.priceB2C : srv.defaultPrice;
          const b2b = srv.priceB2B !== undefined ? srv.priceB2B : Math.round(b2c * 0.8);
          const disc = srv.b2bDiscountPercent !== undefined ? srv.b2bDiscountPercent : (b2c > 0 ? Math.round(((b2c - b2b) / b2c) * 100) : 15);
          const gov = srv.governmentFees || 0;

          return (
            <div
              key={srv.id}
              onClick={() => setSelectedService(srv)}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Header Info */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {srv.code}
                        </span>
                        {srv.pricingTierAvailable && srv.pricingTierAvailable !== 'all' && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            srv.pricingTierAvailable === 'b2b_only' 
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' 
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {srv.pricingTierAvailable === 'b2b_only' ? 'B2B Only' : 'B2C Only'}
                          </span>
                        )}
                      </div>
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

                {/* Dual B2C / B2B Pricing Card Matrix */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  {/* B2C Retail Price Card */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
                        B2C Direct Client Rate:
                      </span>
                    </div>
                    <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-xs">
                      AED {b2c.toLocaleString()}
                    </span>
                  </div>

                  {/* B2B Corporate Partner Price Card */}
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <div>
                        <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 block leading-tight">
                          B2B Corporate Rate:
                        </span>
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                          {disc}% Company Discount
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-indigo-700 dark:text-indigo-400 text-xs block">
                        AED {b2b.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 line-through font-mono">
                        AED {b2c.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Government Fee */}
                  <div className="flex justify-between text-slate-500 text-[11px] px-1">
                    <span>Gov Clearance Fee:</span>
                    <span className="font-semibold text-blue-600 font-mono">
                      AED {gov.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents Checklist Footer */}
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
          );
        })}
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

              {/* Tiered Price Comparison Table */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 font-medium">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Tiered Pricing Schedule</span>
                  <span className="text-[11px] text-slate-500">{selectedService.estimatedDays} business days SLA</span>
                </div>

                {(() => {
                  const b2c = selectedService.priceB2C !== undefined ? selectedService.priceB2C : selectedService.defaultPrice;
                  const b2b = selectedService.priceB2B !== undefined ? selectedService.priceB2B : Math.round(b2c * 0.8);
                  const disc = selectedService.b2bDiscountPercent !== undefined ? selectedService.b2bDiscountPercent : (b2c > 0 ? Math.round(((b2c - b2b) / b2c) * 100) : 15);
                  const gov = selectedService.governmentFees || 0;

                  return (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* B2C Summary */}
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">
                            B2C (Direct Retail)
                          </span>
                          <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 block mt-0.5">
                            AED {b2c.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Total w/ Gov: AED {(b2c + gov).toLocaleString()}
                          </span>
                        </div>

                        {/* B2B Summary */}
                        <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300">
                              B2B (Corporate)
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                              {disc}% OFF
                            </span>
                          </div>
                          <span className="text-sm font-bold font-mono text-indigo-700 dark:text-indigo-400 block mt-0.5">
                            AED {b2b.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Total w/ Gov: AED {(b2b + gov).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        <span>Government & Authority Clearance Fee:</span>
                        <span className="font-bold text-blue-600 font-mono">AED {gov.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
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
                      onClick={() => {
                        setDeletingServiceId(selectedService.id);
                      }}
                      className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 rounded-xl font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal with B2B & B2C Pricing Controls */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl animate-in fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingService ? 'Edit Service & Tiered Pricing' : 'Create Service Catalogue (B2B & B2C)'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure separate retail (B2C) and corporate discount (B2B) rates</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Service Title / Package Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. 5-Year Green Residence Visa Clearance"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
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
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Availability</label>
                  <select
                    value={formData.pricingTierAvailable}
                    onChange={(e) => setFormData({ ...formData, pricingTierAvailable: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <option value="all">All Clients (B2C & B2B Tiers)</option>
                    <option value="b2c_only">B2C Retail Only (Direct Clients)</option>
                    <option value="b2b_only">B2B Corporate Only (Registered Companies)</option>
                  </select>
                </div>
              </div>

              {/* B2B vs B2C Pricing Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-slate-800/80 dark:to-indigo-950/30 border border-blue-200/80 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-900 dark:text-white">Tiered Price Architecture (B2B vs B2C)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Direct individual vs corporate rates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* B2C Retail Price */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                    <label className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      B2C Retail Price (AED) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.priceB2C}
                      onChange={(e) => handleB2CChange(Number(e.target.value))}
                      placeholder="e.g. 4500"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Standard rate for direct walk-in/online clients</p>
                  </div>

                  {/* B2B Corporate Discount % */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-1">
                    <label className="block text-[11px] font-bold text-indigo-800 dark:text-indigo-300 flex items-center justify-between">
                      <span>B2B Discount (%)</span>
                      <Percent className="w-3 h-3 text-indigo-500" />
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.b2bDiscountPercent}
                      onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                      placeholder="e.g. 15"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs"
                    />
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400">Discount granted to registered companies</p>
                  </div>

                  {/* B2B Calculated Price */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-1">
                    <label className="block text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
                      B2B Corporate Price (AED) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.priceB2B}
                      onChange={(e) => handleB2BChange(Number(e.target.value))}
                      placeholder="e.g. 3825"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400"
                    />
                    <p className="text-[10px] text-slate-400">Final fee billed to corporate account clients</p>
                  </div>
                </div>

                {/* Government Pass-through fees */}
                <div className="pt-2 border-t border-blue-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Government & Consular Clearance Fee (AED)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.governmentFees}
                      onChange={(e) => setFormData({ ...formData, governmentFees: Number(e.target.value) })}
                      placeholder="e.g. 1800"
                      className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">MOHRE, ICP, GDRFA, or DED official authority costs</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Total Package Preview</span>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">B2C Total (Fee + Gov):</span>
                      <span className="font-mono font-bold text-emerald-600">
                        AED {(Number(formData.priceB2C || 0) + Number(formData.governmentFees || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">B2B Total (Fee + Gov):</span>
                      <span className="font-mono font-bold text-indigo-600">
                        AED {(Number(formData.priceB2B || 0) + Number(formData.governmentFees || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Service Description</label>
                <textarea
                  rows={2}
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

                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
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
