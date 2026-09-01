import React, { useState, useMemo } from 'react';
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
  Palette,
  Check,
  ArrowRight,
  Settings2,
  FolderTree,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ServiceCategory, ServiceClassification } from '../../types/crm';

const PRESET_COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#DC2626', // Red
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
  '#BE185D', // Pink
  '#475569', // Slate
];

export const ServicesCatalog: React.FC = () => {
  const {
    serviceCategories,
    serviceClassifications,
    addServiceClassification,
    updateServiceClassification,
    deleteServiceClassification,
    addServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    currentUser,
    stages,
    setActiveTab,
  } = useCRM();

  const isClient = currentUser.role === 'client';
  const canManage = currentUser.role === 'master' || currentUser.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [pricingTierFilter, setPricingTierFilter] = useState<'all' | 'b2c' | 'b2b'>('all');
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);

  // Dynamic category tabs from serviceClassifications & serviceCategories
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    (serviceClassifications || []).forEach((c) => {
      if (c && c.name) set.add(c.name);
    });
    (serviceCategories || []).forEach((s) => {
      if (s && s.category) set.add(s.category);
    });
    return ['All', ...Array.from(set)];
  }, [serviceClassifications, serviceCategories]);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCategory | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  // Category Classification Management Modal
  const [showCategoryManagerModal, setShowCategoryManagerModal] = useState(false);
  const [editingClassification, setEditingClassification] = useState<ServiceClassification | null>(null);
  const [deletingClassificationId, setDeletingClassificationId] = useState<string | null>(null);
  const [migrateToCategory, setMigrateToCategory] = useState<string>('General');

  // New Classification Form State
  const [classificationForm, setClassificationForm] = useState({
    name: '',
    description: '',
    color: '#2563EB',
    icon: 'Briefcase',
  });

  // Inline Quick Add Category state inside Service Create modal
  const [showInlineCategoryAdd, setShowInlineCategoryAdd] = useState(false);
  const [inlineCategoryName, setInlineCategoryName] = useState('');

  // Form State for Service
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Visa Processing',
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
    const initialCat = (serviceClassifications && serviceClassifications.length > 0)
      ? serviceClassifications[0].name
      : 'Visa Processing';

    setFormData({
      name: '',
      code: `SRV-${Math.floor(100 + Math.random() * 900)}`,
      category: initialCat,
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
    const b2b = service.priceB2B !== undefined ? service.priceB2B : Math.round(b2c * 0.85);
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
    const disc = formData.b2bDiscountPercent || 15;
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

  const handleInlineAddCategory = () => {
    if (!inlineCategoryName.trim()) return;
    const cleanName = inlineCategoryName.trim();
    const created = addServiceClassification({
      name: cleanName,
      description: `Custom ${cleanName} Category`,
      color: '#2563EB',
      icon: 'Briefcase',
    });
    setFormData((prev) => ({ ...prev, category: created.name }));
    setInlineCategoryName('');
    setShowInlineCategoryAdd(false);
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

  // Category Classification handlers
  const handleOpenClassificationManager = () => {
    setEditingClassification(null);
    setClassificationForm({
      name: '',
      description: '',
      color: '#2563EB',
      icon: 'Briefcase',
    });
    setShowCategoryManagerModal(true);
  };

  const handleStartEditClassification = (cat: ServiceClassification) => {
    setEditingClassification(cat);
    setClassificationForm({
      name: cat.name,
      description: cat.description || '',
      color: cat.color || '#2563EB',
      icon: cat.icon || 'Briefcase',
    });
  };

  const handleSaveClassification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classificationForm.name.trim()) {
      alert('Please enter a classification name.');
      return;
    }

    if (editingClassification) {
      updateServiceClassification(editingClassification.id, {
        name: classificationForm.name.trim(),
        description: classificationForm.description.trim(),
        color: classificationForm.color,
      });
      setEditingClassification(null);
    } else {
      addServiceClassification({
        name: classificationForm.name.trim(),
        description: classificationForm.description.trim(),
        color: classificationForm.color,
        icon: classificationForm.icon || 'Briefcase',
      });
    }

    setClassificationForm({
      name: '',
      description: '',
      color: '#2563EB',
      icon: 'Briefcase',
    });
  };

  const handleDeleteClassificationConfirm = () => {
    if (!deletingClassificationId) return;
    deleteServiceClassification(deletingClassificationId, migrateToCategory);
    setDeletingClassificationId(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {isClient ? 'Services Directory & Government Fee Schedules' : 'Services Catalog & Category Classifications'}
            </h1>
            {!isClient && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                CRUD Enabled
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isClient
              ? 'Browse verified residency visas, business setup, and certified government processing services'
              : 'Create, edit, and organize service packages, category classifications, and standard retail rate schedules'}
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

          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenClassificationManager}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
                title="Create, edit, and delete service category classifications"
              >
                <FolderTree className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Manage Categories</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer hidden lg:flex"
                title="Manage Lead Categories & Stages"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Lead Stages</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Service</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Tier & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold scrollbar-thin">
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

        {/* Pricing Tier Switch (Only shown to Admin / Staff) */}
        {!isClient && (
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
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayServices.map((srv) => {
          const b2c = srv.priceB2C !== undefined ? srv.priceB2C : srv.defaultPrice;
          const b2b = srv.priceB2B !== undefined ? srv.priceB2B : Math.round(b2c * 0.85);
          const disc = srv.b2bDiscountPercent !== undefined ? srv.b2bDiscountPercent : (b2c > 0 ? Math.round(((b2c - b2b) / b2c) * 100) : 15);
          const gov = srv.governmentFees || 0;

          // Find classification color
          const catMeta = (serviceClassifications || []).find((c) => c.name === srv.category);
          const categoryColor = catMeta?.color || '#2563EB';

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
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs"
                      style={{ backgroundColor: categoryColor }}
                    >
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {srv.code}
                        </span>
                        {!isClient && srv.pricingTierAvailable && srv.pricingTierAvailable !== 'all' && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              srv.pricingTierAvailable === 'b2b_only'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
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

                {/* Pricing Card Matrix */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  {/* Standard Service Fee (B2C) */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-300">
                        {isClient ? 'Standard Service Fee:' : 'B2C Direct Client Rate:'}
                      </span>
                    </div>
                    <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-xs">
                      AED {b2c.toLocaleString()}
                    </span>
                  </div>

                  {/* B2B Corporate Partner Price Card (HIDDEN FOR CLIENTS) */}
                  {!isClient && (
                    <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <div>
                          <span className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 block leading-tight">
                            B2B Corporate Rate:
                          </span>
                          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                            {disc}% Baseline Discount
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
                  )}

                  {/* Government Fee */}
                  <div className="flex justify-between text-slate-500 text-[11px] px-1">
                    <span>Gov & Authority Fee:</span>
                    <span className="font-semibold text-blue-600 font-mono">
                      AED {gov.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents Checklist Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                  Required Documents ({srv.requiredDocuments.length}):
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
              <button onClick={() => setSelectedService(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">{selectedService.description}</p>

              {/* Price Schedule */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3 font-medium">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Official Price Schedule</span>
                  <span className="text-[11px] text-slate-500">{selectedService.estimatedDays} business days SLA</span>
                </div>

                {(() => {
                  const b2c = selectedService.priceB2C !== undefined ? selectedService.priceB2C : selectedService.defaultPrice;
                  const b2b = selectedService.priceB2B !== undefined ? selectedService.priceB2B : Math.round(b2c * 0.85);
                  const disc = selectedService.b2bDiscountPercent !== undefined ? selectedService.b2bDiscountPercent : (b2c > 0 ? Math.round(((b2c - b2b) / b2c) * 100) : 15);
                  const gov = selectedService.governmentFees || 0;

                  return (
                    <div className="space-y-2">
                      <div className={`grid ${isClient ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                        {/* B2C Summary */}
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block">
                            {isClient ? 'Standard Retail Fee' : 'B2C (Direct Retail)'}
                          </span>
                          <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400 block mt-0.5">
                            AED {b2c.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            Total w/ Gov: AED {(b2c + gov).toLocaleString()}
                          </span>
                        </div>

                        {/* B2B Summary (Staff/Admin Only) */}
                        {!isClient && (
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
                        )}
                      </div>

                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        <span>Government Official Authority Fee:</span>
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
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Service</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeletingServiceId(selectedService.id);
                      }}
                      className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold ml-auto cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Classification Management Modal (CRUD) */}
      {showCategoryManagerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl animate-in fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Category Classifications Management
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create, edit, rename, and delete service classification groups
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryManagerModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 pt-4 text-xs">
              {/* Add / Edit Category Form */}
              <form
                onSubmit={handleSaveClassification}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    {editingClassification ? 'Edit Category Classification' : 'Add New Category Classification'}
                  </span>
                  {editingClassification && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingClassification(null);
                        setClassificationForm({
                          name: '',
                          description: '',
                          color: '#2563EB',
                          icon: 'Briefcase',
                        });
                      }}
                      className="text-slate-500 hover:text-slate-700 text-[11px] underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Classification Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={classificationForm.name}
                      onChange={(e) => setClassificationForm({ ...classificationForm, name: e.target.value })}
                      placeholder="e.g. Corporate Tax, Golden Visas, Mainland Licences"
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Theme Color</label>
                    <div className="flex items-center gap-1.5">
                      {PRESET_COLORS.slice(0, 5).map((clr) => (
                        <button
                          key={clr}
                          type="button"
                          onClick={() => setClassificationForm({ ...classificationForm, color: clr })}
                          className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                            classificationForm.color === clr ? 'scale-110 border-slate-900 dark:border-white ring-2 ring-blue-400' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: clr }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={classificationForm.description}
                      onChange={(e) => setClassificationForm({ ...classificationForm, description: e.target.value })}
                      placeholder="Brief overview of services grouped under this category"
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingClassification ? 'Save Classification Changes' : 'Create Category Classification'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List with counts and actions */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2.5">
                  Active Classifications ({serviceClassifications.length})
                </h4>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  {serviceClassifications.map((cat) => {
                    const servicesCount = (serviceCategories || []).filter((s) => s.category === cat.name).length;

                    return (
                      <div
                        key={cat.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color || '#2563EB' }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{cat.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {servicesCount} {servicesCount === 1 ? 'Service' : 'Services'}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-[11px] text-slate-500 truncate">{cat.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditClassification(cat)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Rename or edit category classification"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingClassificationId(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Delete category classification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowCategoryManagerModal(false)}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Classification Modal */}
      {deletingClassificationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Category Classification</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to remove this category classification? Any existing services assigned to this category will be migrated to the selected fallback category below.
            </p>

            <div className="mb-5 space-y-1 text-xs">
              <label className="block font-medium text-slate-700 dark:text-slate-300">
                Migrate existing services to:
              </label>
              <select
                value={migrateToCategory}
                onChange={(e) => setMigrateToCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
              >
                {serviceClassifications
                  .filter((c) => c.id !== deletingClassificationId)
                  .map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                <option value="General">General</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingClassificationId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClassificationConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete & Migrate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Service Modal with B2C Pricing Controls & Flexible Manual B2B Rates */}
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
                    {editingService ? 'Edit Service Catalog Item' : 'Create Service Catalog Package'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure standard retail (B2C) rate schedule and government official fees
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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

                {/* Dynamic Category Selection with Inline "+ New" Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-medium text-slate-700 dark:text-slate-300">Category Classification</label>
                    <button
                      type="button"
                      onClick={() => setShowInlineCategoryAdd(!showInlineCategoryAdd)}
                      className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{showInlineCategoryAdd ? 'Select Existing' : '+ New Category'}</span>
                    </button>
                  </div>

                  {showInlineCategoryAdd ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={inlineCategoryName}
                        onChange={(e) => setInlineCategoryName(e.target.value)}
                        placeholder="Enter new category..."
                        className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-blue-400 text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleInlineAddCategory}
                        className="px-3 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      {serviceClassifications.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                      {!serviceClassifications.some((c) => c.name === formData.category) && (
                        <option value={formData.category}>{formData.category}</option>
                      )}
                    </select>
                  )}
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

              {/* Standard B2C Pricing Section & Flexible Corporate B2B note */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-slate-800/80 dark:to-indigo-950/30 border border-blue-200/80 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 dark:text-white">Service Rate & Pricing Structure</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">B2C Retail and Government Pass-Through</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Standard B2C Retail Price */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                    <label className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      Standard Service Fee (B2C Retail) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.priceB2C}
                      onChange={(e) => handleB2CChange(Number(e.target.value))}
                      placeholder="e.g. 3500"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Standard service fee displayed to direct clients</p>
                  </div>

                  {/* Government Pass-through fees */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800/60 space-y-1">
                    <label className="block text-[11px] font-bold text-blue-800 dark:text-blue-300">
                      Government Official Authority Fee (AED)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.governmentFees}
                      onChange={(e) => setFormData({ ...formData, governmentFees: Number(e.target.value) })}
                      placeholder="e.g. 1800"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs"
                    />
                    <p className="text-[10px] text-slate-400">MOHRE, ICP, GDRFA, or DED official fees</p>
                  </div>
                </div>

                {/* Flexible Corporate B2B Note */}
                <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-300">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Flexible Corporate B2B Rates:</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-indigo-800/80 dark:text-indigo-300/80">
                    Corporate rates are not fixed in the catalog. Every time a corporate client or company is interested in a product, admins and staff can specify or negotiate a custom manual rate or tailored discount on the spot.
                  </p>
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
                    className="px-3.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-bold cursor-pointer"
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
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingService ? 'Update Service' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Service Confirmation Modal */}
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
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
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
