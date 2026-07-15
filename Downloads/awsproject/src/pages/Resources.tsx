/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceRequest, NGO, Volunteer, ResourceItem, ResourceCategory } from '../types';
import { DisasterDBServ } from '../firebase';
import { apiService } from '../services/apiService';
import { 
  Package, 
  GitPullRequest, 
  Check, 
  Truck, 
  Users, 
  Heart, 
  Clock, 
  ShieldAlert, 
  Inbox,
  X,
  Plus,
  Loader,
  Search,
  ArrowUpDown,
  Filter,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle,
  FileText,
  Boxes,
  RefreshCw,
  Info
} from 'lucide-react';

export const Resources: React.FC = () => {
  const { 
    resources, 
    requests, 
    ngos, 
    volunteers, 
    updateRequestStatus, 
    dispatchDelivery,
    currentUser,
    refreshAllData,
    logActivity
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'requests'>('inventory');
  
  // Dispatch Modal state
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Search & Filter state for Inventory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all'); // all, out, shortage, adequate
  const [showShortagesOnly, setShowShortagesOnly] = useState(false);

  // Sorting state for Inventory
  const [sortField, setSortField] = useState<keyof ResourceItem | ''>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Add / Edit Resource Modal state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null); // null = Add, ResourceItem = Edit
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ResourceCategory>('Food');
  const [formStock, setFormStock] = useState<number>(0);
  const [formReserved, setFormReserved] = useState<number>(0);
  const [formDelivered, setFormDelivered] = useState<number>(0);
  const [formUnit, setFormUnit] = useState('Units');
  const [formWarehouse, setFormWarehouse] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');

  const isAuthority = currentUser ? ['Super Admin', 'Disaster Management Authority', 'NGO', 'Shelter Manager'].includes(currentUser.role) : false;
  const isNgo = currentUser?.role === 'NGO';

  // Constants
  const CATEGORIES: ResourceCategory[] = ['Food', 'Water', 'Blankets', 'Medicine', 'Baby Food', 'Fuel', 'Medical Kits', 'Clothes'];

  // Extract unique warehouses dynamically
  const uniqueWarehouses = useMemo(() => {
    const list = resources.map(r => r.warehouse).filter(Boolean);
    return Array.from(new Set(list));
  }, [resources]);

  // Compute dynamic stock metrics
  const stockMetrics = useMemo(() => {
    let totalStock = 0;
    let totalReserved = 0;
    let totalDelivered = 0;
    let shortageCount = 0;
    let outOfStockCount = 0;

    resources.forEach(item => {
      totalStock += item.stock;
      totalReserved += item.reserved;
      totalDelivered += item.delivered;
      if (item.stock === 0) {
        outOfStockCount++;
      } else if (item.stock <= 1500) {
        shortageCount++;
      }
    });

    return {
      totalStock,
      totalReserved,
      totalDelivered,
      shortageCount,
      outOfStockCount
    };
  }, [resources]);

  // Sort and Filter logic
  const filteredAndSortedResources = useMemo(() => {
    // 1. Filter
    const filtered = resources.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse;

      let matchesStatus = true;
      if (selectedStockStatus === 'out') {
        matchesStatus = item.stock === 0;
      } else if (selectedStockStatus === 'shortage') {
        matchesStatus = item.stock > 0 && item.stock <= 1500;
      } else if (selectedStockStatus === 'adequate') {
        matchesStatus = item.stock > 1500;
      }

      const matchesShortageToggle = !showShortagesOnly || item.stock <= 1500;

      return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus && matchesShortageToggle;
    });

    // 2. Sort
    if (!sortField) return filtered;

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined) valA = '';
      if (valB === undefined) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        // Numbers
        return sortDirection === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

    return sorted;
  }, [resources, searchQuery, selectedCategory, selectedWarehouse, selectedStockStatus, showShortagesOnly, sortField, sortDirection]);

  // Handle Sort Change
  const handleSort = (field: keyof ResourceItem) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedWarehouse('all');
    setSelectedStockStatus('all');
    setShowShortagesOnly(false);
    setSortField('name');
    setSortDirection('asc');
  };

  // Open Modals
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Food');
    setFormStock(0);
    setFormReserved(0);
    setFormDelivered(0);
    setFormUnit('Units');
    setFormWarehouse('');
    setFormSupplier('');
    setFormExpiryDate('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (item: ResourceItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormStock(item.stock);
    setFormReserved(item.reserved);
    setFormDelivered(item.delivered);
    setFormUnit(item.unit);
    setFormWarehouse(item.warehouse);
    setFormSupplier(item.supplier);
    setFormExpiryDate(item.expiryDate || '');
    setIsAddEditModalOpen(true);
  };

  // Save/Create item inside db
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formWarehouse.trim() || !formSupplier.trim() || !formUnit.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmittingResource(true);
    try {
      const resourceId = editingItem ? editingItem.id : `res-${Date.now()}`;
      const updatedItem: ResourceItem = {
        id: resourceId,
        name: formName.trim(),
        category: formCategory,
        stock: Number(formStock),
        reserved: Number(formReserved),
        delivered: Number(formDelivered),
        unit: formUnit.trim(),
        warehouse: formWarehouse.trim(),
        supplier: formSupplier.trim(),
        expiryDate: formExpiryDate ? formExpiryDate : undefined
      };

      if (editingItem) {
        await apiService.resources.update(updatedItem);
      } else {
        await apiService.resources.create(updatedItem);
      }
      
      const actionLabel = editingItem ? 'Modified Logistics Inventory' : 'Added New Relief Asset';
      const actionDetails = editingItem 
        ? `Modified parameters of spare relief asset '${formName}' (ID: ${resourceId}). Stock level set to ${formStock} ${formUnit}.`
        : `Added new stock profile of '${formName}' (${formStock} ${formUnit}) under ${formWarehouse} ledger.`;

      await logActivity(actionLabel, actionDetails);
      await refreshAllData();
      setIsAddEditModalOpen(false);
    } catch (err: any) {
      console.error('Failed to update resource:', err);
      alert(`Could not save inventory item to the ledger database: ${err.message || err}`);
    } finally {
      setIsSubmittingResource(false);
    }
  };

  // Delete item from db
  const handleDeleteResource = async (id: string, name: string) => {
    if (confirm(`CRITICAL NOTICE:\nAre you sure you want to completely retire and remove relief resource '${name}' (ID: ${id}) from the database? This action cannot be undone.`)) {
      try {
        await apiService.resources.delete(id);
        await logActivity('Retired Relief Resource', `Retired and removed relief supply asset '${name}' (ID: ${id}) from central warehouses.`);
        await refreshAllData();
      } catch (err: any) {
        console.error('Failed to delete resource:', err);
        alert(`Could not delete the inventory item: ${err.message || err}`);
      }
    }
  };

  // Requisitions handlers
  const handleApproveRequest = async (id: string) => {
    if (confirm('Verify: Allocate reserves and approve this shelter demand?')) {
      await updateRequestStatus(id, 'Approved');
    }
  };

  const handleOpenDispatch = (req: ResourceRequest) => {
    setSelectedRequest(req);
    const activeNgo = ngos[0];
    const availVol = volunteers.find(v => v.availability === 'Available');
    
    setSelectedNgoId(activeNgo ? activeNgo.id : '');
    setSelectedVolunteerId(availVol ? availVol.id : '');
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedNgoId || !selectedVolunteerId) {
      alert('Please select both an NGO Alliance partner and an Available Mobile Responder to complete dispatch.');
      return;
    }

    setIsDispatching(true);
    await dispatchDelivery(selectedRequest.id, selectedNgoId, selectedVolunteerId);
    setIsDispatching(false);
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation tabs & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="bg-white border border-slate-200 p-1 rounded-xl flex max-w-md shadow-sm w-full md:w-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 text-center py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
          >
            <Package className="h-4 w-4" />
            <span>Logistics Inventory Stocks</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 text-center py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
          >
            <GitPullRequest className="h-4 w-4" />
            <span>Emergency Requisition Queue</span>
            {requests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="ml-1.5 bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold animate-pulse">
                {requests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'inventory' && isAuthority && (
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm border border-indigo-700 transition-colors self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Register New Supply Asset</span>
          </button>
        )}
      </div>

      {/* RENDER TAB: Logistics Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Inventory Summary Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Total Stock Items</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-950 font-mono">
                  {stockMetrics.totalStock.toLocaleString()}
                </span>
                <span className="text-[10px] bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded font-bold text-slate-500 font-mono">
                  GLOBAL
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Reserved Reserves</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-black text-amber-600 font-mono">
                  {stockMetrics.totalReserved.toLocaleString()}
                </span>
                <span className="text-[10px] bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded font-bold text-amber-600 font-mono">
                  ALLOCATED
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Delivered Volume</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-black text-emerald-600 font-mono">
                  {stockMetrics.totalDelivered.toLocaleString()}
                </span>
                <span className="text-[10px] bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-bold text-emerald-600 font-mono">
                  SUCCESSFUL
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Urgent Shortages</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-black text-orange-600 font-mono">
                  {stockMetrics.shortageCount}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${stockMetrics.shortageCount > 0 ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                  LOW STOCK
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Out of Stock Assets</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-black text-rose-600 font-mono">
                  {stockMetrics.outOfStockCount}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${stockMetrics.outOfStockCount > 0 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                  DEPLETED
                </span>
              </div>
            </div>

          </div>

          {/* Urgent Shortage Banner Alert */}
          {(stockMetrics.shortageCount > 0 || stockMetrics.outOfStockCount > 0) && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-1.5 bg-orange-500 text-white rounded-lg flex-shrink-0 mt-0.5">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                    Urgent Supplies Logistics Shortages Detected ({stockMetrics.shortageCount + stockMetrics.outOfStockCount} items)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    Certain emergency relief items (MREs, Propane/Diesel fuel, blankets, medical kits) have fallen below the critical threshold of 1,500 units or are completely depleted. Prioritize supply chain re-order dispatches immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowShortagesOnly(true);
                  setSelectedStockStatus('all');
                }}
                className="text-[11px] font-extrabold text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg border border-orange-200 cursor-pointer transition-colors shrink-0 font-mono uppercase"
              >
                Isolate Shortages
              </button>
            </div>
          )}

          {/* Search, Filter & Controls Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Ledger Registry Filter Controls
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors flex items-center space-x-1 uppercase font-mono cursor-pointer"
                  title="Reset all filter fields"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Search input */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 uppercase font-mono text-[10px] tracking-wide">
                  Keyword Search
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, supplier, depot..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-8"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 uppercase font-mono text-[10px] tracking-wide">
                  Resource Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 cursor-pointer"
                >
                  <option value="all">All Categories ({CATEGORIES.length})</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Warehouse selector */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 uppercase font-mono text-[10px] tracking-wide">
                  Storage Depot / Warehouse
                </label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 cursor-pointer"
                >
                  <option value="all">All Depots ({uniqueWarehouses.length})</option>
                  {uniqueWarehouses.map(wh => (
                    <option key={wh} value={wh}>{wh}</option>
                  ))}
                </select>
              </div>

              {/* Stock status selector */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 uppercase font-mono text-[10px] tracking-wide">
                  Stock Safety Status
                </label>
                <select
                  value={selectedStockStatus}
                  onChange={(e) => {
                    setSelectedStockStatus(e.target.value);
                    if (e.target.value !== 'all') {
                      setShowShortagesOnly(false);
                    }
                  }}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg py-2 px-3 cursor-pointer"
                >
                  <option value="all">All Stocks Status</option>
                  <option value="adequate">Adequate Stock (&gt; 1500 units)</option>
                  <option value="shortage">Low Stock / Impending Shortage (≤ 1500 units)</option>
                  <option value="out">OUT OF STOCK (0 units)</option>
                </select>
              </div>

            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showShortagesOnly}
                    onChange={(e) => {
                      setShowShortagesOnly(e.target.checked);
                      if (e.target.checked) {
                        setSelectedStockStatus('all');
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Isolate Urgent Shortages Only</span>
                </label>
              </div>

              <div className="text-[10px] text-slate-400 font-mono uppercase">
                Showing {filteredAndSortedResources.length} of {resources.length} relief listings in ledger
              </div>
            </div>

          </div>

          {/* Interactive Data Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold font-mono text-[10px] border-b border-slate-150 uppercase">
                    
                    <th 
                      onClick={() => handleSort('name')}
                      className="py-3 px-5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer select-none transition-colors group"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Supply Description</span>
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('category')}
                      className="py-3 px-5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer select-none transition-colors group"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Category</span>
                        {sortField === 'category' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('stock')}
                      className="py-3 px-5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer select-none transition-colors group text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Available Stock</span>
                        {sortField === 'stock' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('reserved')}
                      className="py-3 px-5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer select-none transition-colors group text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Reserved</span>
                        {sortField === 'reserved' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('delivered')}
                      className="py-3 px-5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer select-none transition-colors group text-right"
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <span>Delivered</span>
                        {sortField === 'delivered' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('warehouse')}
                      className="py-3 px-5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer select-none transition-colors group"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Warehouse Depot</span>
                        {sortField === 'warehouse' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('supplier')}
                      className="py-3 px-5 hover:bg-slate-100 hover:text-slate-900 cursor-pointer select-none transition-colors group"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Strategic Supplier</span>
                        {sortField === 'supplier' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>
                    </th>

                    {isAuthority && (
                      <th className="py-3 px-5 text-right">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedResources.length === 0 ? (
                    <tr>
                      <td colSpan={isAuthority ? 8 : 7} className="py-12 text-center text-slate-400">
                        <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                        <span className="font-semibold block text-slate-600">No matching supplies found.</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Try resetting your filter parameters or searching with a different keyword.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedResources.map(item => {
                      const isOutOfStock = item.stock === 0;
                      const isLowStock = item.stock > 0 && item.stock <= 1500;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          
                          {/* Name + Status indicators */}
                          <td className="py-3.5 px-5">
                            <div className="space-y-1">
                              <span className="font-semibold text-slate-900 block leading-tight">{item.name}</span>
                              
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                <span className="text-[8px] font-mono text-slate-400">ID: #{item.id}</span>
                                {item.expiryDate && (
                                  <span className="text-[8px] bg-slate-100 border border-slate-150 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                                    EXP: {item.expiryDate}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-5">
                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono">
                              {item.category}
                            </span>
                          </td>

                          {/* Available Stock + alert colors */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="space-y-0.5">
                              <span className={`font-black font-mono text-xs block ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-orange-500' : 'text-slate-950'}`}>
                                {item.stock.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                              </span>
                              
                              {/* Warning indicators */}
                              {isOutOfStock ? (
                                <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 text-[8px] font-bold px-1.5 py-0.2 rounded border border-rose-200 uppercase tracking-wide font-mono animate-pulse">
                                  <AlertTriangle className="h-2 w-2" />
                                  <span>Depleted / Reorder</span>
                                </span>
                              ) : isLowStock ? (
                                <span className="inline-flex items-center space-x-1 bg-orange-50 text-orange-700 text-[8px] font-bold px-1.5 py-0.2 rounded border border-orange-200 uppercase tracking-wide font-mono">
                                  <span>Shortage Warning</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.2 rounded border border-emerald-150 uppercase tracking-wide font-mono">
                                  <span>Nominal Adequate</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Reserved Units */}
                          <td className="py-3.5 px-5 text-right font-bold text-amber-600 font-mono">
                            {item.reserved.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                          </td>

                          {/* Delivered Units */}
                          <td className="py-3.5 px-5 text-right font-bold text-sky-600 font-mono">
                            {item.delivered.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                          </td>

                          {/* Warehouse */}
                          <td className="py-3.5 px-5 text-slate-500 font-medium">
                            {item.warehouse}
                          </td>

                          {/* Supplier */}
                          <td className="py-3.5 px-5 text-slate-400">
                            {item.supplier}
                          </td>

                          {/* Action Buttons for Authorized Roles */}
                          {isAuthority && (
                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end space-x-1.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200 shadow-sm inline-flex">
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-colors cursor-pointer"
                                  title={`Edit details for ${item.name}`}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteResource(item.id, item.name)}
                                  className="p-1 bg-rose-50 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded border border-rose-100 transition-colors cursor-pointer"
                                  title={`Delete ${item.name} from inventory`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          )}

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* RENDER TAB: Requisitions Queue */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Emergency Resource Requests Ledger</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Demands submitted by shelter managers awaiting handoffs.</p>
          </div>

          <div className="space-y-3.5">
            {requests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-xs text-slate-400">
                <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <span>No filed resource requisitions in queue.</span>
              </div>
            ) : (
              requests.map(req => {
                const isPending = req.status === 'Pending';
                const isApproved = req.status === 'Approved';

                return (
                  <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all relative">
                    
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">REQUISITION ID: #{req.id}</span>
                        <h4 className="text-xs font-extrabold text-slate-950 mt-1">{req.shelterName}</h4>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          req.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                          req.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-slate-50 text-slate-600 border-slate-150'
                        }`}>
                          {req.priority} Priority
                        </span>

                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          req.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {/* Ordered quantities checklist */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 border border-slate-150 p-4 rounded-xl">
                      {req.items.map((it, idx) => (
                        <div key={idx} className="font-mono">
                          <span className="text-[9px] text-slate-400 font-sans block truncate" title={it.item}>{it.item}</span>
                          <span className="text-sm font-black text-slate-950 mt-1 block">
                            {it.quantity.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Operational footer with actions */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-slate-300" />
                        <span>Submitted on: {req.date}</span>
                      </span>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {isPending && isAuthority && (
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Allocate Reserves</span>
                          </button>
                        )}

                        {isApproved && isAuthority && (
                          <button
                            onClick={() => handleOpenDispatch(req)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm cursor-pointer"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            <span>Dispatch Supply Convoy</span>
                          </button>
                        )}

                        {req.assignedNgoName && (
                          <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                            <span>NGO: <span className="font-bold text-slate-700">{req.assignedNgoName}</span></span>
                            <span>•</span>
                            <span>Volunteer: <span className="font-bold text-slate-700">{req.assignedVolunteerName}</span></span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* DISPATCH CONVOY WORKFLOW DIALOG */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Initialize Dispatch Convoy</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 mt-4 text-xs">
              
              <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-indigo-850 space-y-1">
                <span className="font-bold block">Consolidated Order Requisition:</span>
                <span className="block font-mono text-[10px]">Shelter Target: {selectedRequest.shelterName}</span>
                <span className="block font-mono text-[10px]">Supply items: {selectedRequest.items.length} categories allocated</span>
              </div>

              {/* Select NGO */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Assign Responder NGO Alliance
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Users className="h-4 w-4" />
                  </span>
                  <select
                    required
                    value={selectedNgoId}
                    onChange={(e) => setSelectedNgoId(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-3 cursor-pointer"
                  >
                    <option value="">Select NGO partner...</option>
                    {ngos.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} (Active tasks: {n.activeTasks})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Volunteer */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Assign Mobile Volunteer Responder
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Heart className="h-4 w-4" />
                  </span>
                  <select
                    required
                    value={selectedVolunteerId}
                    onChange={(e) => setSelectedVolunteerId(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-3 cursor-pointer"
                  >
                    <option value="">Select available volunteer...</option>
                    {volunteers.map(v => (
                      <option key={v.id} value={v.id} disabled={v.availability === 'Busy'}>
                        {v.name} - {v.vehicle} ({v.availability})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isDispatching}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white px-4 py-2 rounded-lg font-semibold shadow-sm flex items-center space-x-1"
                >
                  {isDispatching && <Loader className="h-3.5 w-3.5 animate-spin" />}
                  <span>Verify and Launch Handoff</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT RESOURCE DIALOG */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase font-mono flex items-center space-x-1.5">
                <Boxes className="h-4.5 w-4.5 text-indigo-600" />
                <span>{editingItem ? 'Edit Supply Asset Details' : 'Register New Relief Asset'}</span>
              </h3>
              <button 
                onClick={() => setIsAddEditModalOpen(false)} 
                className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-4 mt-4 text-xs">
              
              {/* Name */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wide">
                  Supply Item Description / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purified Potable Water Box"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wide">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ResourceCategory)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 px-3 cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Unit type */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wide">
                    Measurement Unit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liters, Units, Meals, Cases"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 px-3"
                  />
                </div>

              </div>

              {/* Quantities (Stock, Reserved, Delivered) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                
                {/* Available Stock */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                    Available Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-mono text-xs"
                  />
                  <span className="text-[9px] text-slate-400 block font-medium">Free stock on shelf</span>
                </div>

                {/* Reserved Stock */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                    Reserved Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formReserved}
                    onChange={(e) => setFormReserved(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-mono text-xs"
                  />
                  <span className="text-[9px] text-slate-400 block font-medium">Dedicated reserves</span>
                </div>

                {/* Delivered Stock */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                    Delivered Volume
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formDelivered}
                    onChange={(e) => setFormDelivered(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-mono text-xs"
                  />
                  <span className="text-[9px] text-slate-400 block font-medium">Sent historical vol</span>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Storage Depot */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wide">
                    Storage Depot / Warehouse <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Federal Logistics Depot"
                    value={formWarehouse}
                    onChange={(e) => setFormWarehouse(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 px-3"
                  />
                </div>

                {/* Strategic Supplier */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wide">
                    Strategic Supplier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Global Relief Partners"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 px-3"
                  />
                </div>

              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wide">
                  Product Expiry Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  placeholder="YYYY-MM-DD"
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 px-3 cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingResource}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white px-5 py-2 rounded-lg font-semibold shadow-sm flex items-center space-x-1.5 cursor-pointer border border-indigo-700"
                >
                  {isSubmittingResource && <Loader className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save relief item</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
