/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceRequest, RequestPriority, RequestStatus, Shelter } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitPullRequest, 
  Inbox, 
  Clock, 
  Check, 
  Truck, 
  Users, 
  Heart, 
  Loader, 
  X, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ChevronRight, 
  FileSpreadsheet, 
  RefreshCw, 
  ShieldCheck, 
  CornerDownRight, 
  Info,
  Calendar,
  Building,
  Activity,
  Archive,
  ArrowRight
} from 'lucide-react';

export const Requests: React.FC = () => {
  const { 
    requests, 
    shelters, 
    resources, 
    ngos, 
    volunteers, 
    addResourceRequest, 
    updateRequestStatus, 
    dispatchDelivery, 
    currentUser 
  } = useApp();

  // Active navigation / detail states
  const [selectedReqId, setSelectedReqId] = useState<string | null>(requests[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState<ResourceRequest | null>(null);
  
  // Dispatch form states
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Requisition Form states
  const [reqShelterId, setReqShelterId] = useState('');
  const [reqPriority, setReqPriority] = useState<RequestPriority>('High');
  const [reqItems, setReqItems] = useState<{ item: string; quantity: number }[]>([]);
  const [currentSelectedResource, setCurrentSelectedResource] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthority = currentUser ? ['Super Admin', 'Disaster Management Authority'].includes(currentUser.role) : false;
  const isShelterManager = currentUser ? ['Super Admin', 'Disaster Management Authority', 'Shelter Manager'].includes(currentUser.role) : false;

  // Selected request finder
  const activeRequest = requests.find(r => r.id === selectedReqId) || requests[0] || null;

  // Calculations for telemetry widgets
  const totalRequisitions = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const transitCount = requests.filter(r => ['Approved', 'Assigned', 'In Transit'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.shelterName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Action: Allocate Reserves (Move Pending to Approved)
  const handleApproveRequest = async (id: string) => {
    try {
      await updateRequestStatus(id, 'Approved');
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Dispatch Convoy Submission
  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDispatchModal || !selectedNgoId || !selectedVolunteerId) return;

    setIsDispatching(true);
    try {
      await dispatchDelivery(showDispatchModal.id, selectedNgoId, selectedVolunteerId);
      setShowDispatchModal(null);
      setSelectedNgoId('');
      setSelectedVolunteerId('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispatching(false);
    }
  };

  // Add Item to active custom requisition form
  const handleAddFormItem = () => {
    if (!currentSelectedResource || currentQuantity <= 0) return;
    
    // Check if duplicate
    const existingIdx = reqItems.findIndex(it => it.item === currentSelectedResource);
    if (existingIdx > -1) {
      const updated = [...reqItems];
      updated[existingIdx].quantity += currentQuantity;
      setReqItems(updated);
    } else {
      setReqItems([...reqItems, { item: currentSelectedResource, quantity: currentQuantity }]);
    }
    
    setCurrentSelectedResource('');
    setCurrentQuantity(100);
  };

  const handleRemoveFormItem = (index: number) => {
    setReqItems(reqItems.filter((_, idx) => idx !== index));
  };

  // Action: Submit Custom Requisition
  const handleCreateRequisitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine Shelter ID to file for
    const targetShelterId = reqShelterId || (shelters[0]?.id || '');
    if (!targetShelterId) {
      alert('A valid shelter endpoint registry must be specified.');
      return;
    }

    if (reqItems.length === 0) {
      alert('At least one supply item must be added to file a resource requisition.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addResourceRequest(targetShelterId, reqItems, reqPriority);
      setShowAddModal(false);
      setReqItems([]);
      setReqShelterId('');
      setReqPriority('High');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Route Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
              <GitPullRequest className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">Operational Command</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">Emergency Requisitions Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">Allocate strategic relief resources, map volunteer transport corridors, and track active deliveries.</p>
        </div>

        {isShelterManager && (
          <button
            onClick={() => {
              if (shelters.length === 0) {
                alert('Initialize at least one Swaraj shelter registry before creating demands.');
                return;
              }
              setReqShelterId(shelters[0]?.id || '');
              setShowAddModal(true);
            }}
            className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-rose-700"
          >
            <Plus className="h-4 w-4" />
            <span>File Resource Requisition</span>
          </button>
        )}
      </div>

      {/* Control Telemetry Bento Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total demands */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center space-x-3.5 hover:shadow-md transition-all">
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
            <Archive className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">Total Requisitions</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{totalRequisitions}</span>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center space-x-3.5 hover:shadow-md transition-all">
          <div className={`p-2.5 rounded-lg border ${pendingCount > 0 ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">Pending Allocation</span>
            <span className={`text-xl font-black mt-0.5 block ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{pendingCount}</span>
          </div>
        </div>

        {/* Convoys In Transit */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center space-x-3.5 hover:shadow-md transition-all">
          <div className={`p-2.5 rounded-lg border ${transitCount > 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">Active Transport</span>
            <span className={`text-xl font-black mt-0.5 block ${transitCount > 0 ? 'text-indigo-600' : 'text-slate-900'}`}>{transitCount}</span>
          </div>
        </div>

        {/* Fulfilled */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center space-x-3.5 hover:shadow-md transition-all">
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">Completed Deliveries</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{completedCount}</span>
          </div>
        </div>

      </div>

      {/* Split-Screen Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Master Search, Filters & List (Size: 7/12) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Master Search & Filter Box */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search by shelter name or requisition ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              
              {/* Priority Select */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 text-[10px] font-medium font-mono uppercase">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-250 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Status Select */}
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 text-[10px] font-medium font-mono uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-250 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 cursor-pointer"
                >
                  <option value="all">All States</option>
                  <option value="Pending">Pending Approval</option>
                  <option value="Approved">Approved Reserves</option>
                  <option value="Assigned">Assigned Logistics</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Completed">Fulfilled</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(priorityFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setPriorityFilter('all');
                    setStatusFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-rose-600 hover:text-rose-700 hover:underline text-[10px] font-bold font-mono ml-auto uppercase"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Master Requisitions List */}
          <div className="space-y-2.5">
            {filteredRequests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                <Inbox className="h-9 w-9 text-slate-300 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-slate-900">No Requisitions Found</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">Try loosening your search filters or record a new requisition demand.</p>
              </div>
            ) : (
              filteredRequests.map(req => {
                const isSelected = req.id === selectedReqId;
                
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReqId(req.id)}
                    className={`border rounded-xl p-4 transition-all relative cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-indigo-50/40 border-indigo-500 ring-1 ring-indigo-500 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">ID: #{req.id}</span>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>{req.shelterName}</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 flex items-center space-x-1 font-mono pt-1">
                          <Clock className="h-3 w-3" />
                          <span>Filed: {req.date}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          req.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                          req.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-slate-50 text-slate-600 border-slate-150'
                        }`}>
                          {req.priority}
                        </span>

                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          req.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    {/* Compact Item Counter */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{req.items.length} supply categories requested</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail Panel (Size: 5/12) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {activeRequest ? (
              <motion.div
                key={activeRequest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5"
              >
                {/* Header */}
                <div className="border-b border-slate-100 pb-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-150 rounded px-2 py-0.5 font-bold">REQUISITION ID: #{activeRequest.id}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      activeRequest.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      activeRequest.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-slate-50 text-slate-600 border-slate-150'
                    }`}>
                      {activeRequest.priority} Priority
                    </span>
                  </div>
                  <h2 className="text-sm font-black text-slate-950">{activeRequest.shelterName}</h2>
                  <p className="text-[11px] text-slate-400 flex items-center space-x-1 pt-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Submitted on: {activeRequest.date}</span>
                  </p>
                </div>

                {/* State Progress Telemetry bar */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wide">Status Workflow Progress</span>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[10px] font-mono font-bold">
                    <span className={activeRequest.status === 'Pending' ? 'text-amber-600' : 'text-slate-400'}>1. Pending</span>
                    <ArrowRight className="h-3 w-3 text-slate-300" />
                    <span className={activeRequest.status === 'Approved' ? 'text-indigo-600' : 'text-slate-400'}>2. Approved</span>
                    <ArrowRight className="h-3 w-3 text-slate-300" />
                    <span className={['Assigned', 'In Transit'].includes(activeRequest.status) ? 'text-blue-600' : 'text-slate-400'}>3. Transport</span>
                    <ArrowRight className="h-3 w-3 text-slate-300" />
                    <span className={activeRequest.status === 'Completed' ? 'text-emerald-600' : 'text-slate-400'}>4. Done</span>
                  </div>
                </div>

                {/* Demand List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wide block">Allocated Cargo Specification</span>
                  <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/40">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono font-extrabold text-slate-500 uppercase">
                          <th className="py-2.5 px-3.5">Relief Asset Item</th>
                          <th className="py-2.5 px-3.5 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {activeRequest.items.map((it, idx) => {
                          const matchedRes = resources.find(r => r.name === it.item);
                          const isShortage = matchedRes ? (matchedRes.stock < it.quantity) : true;
                          
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-3 px-3.5">
                                <span className="font-medium text-slate-900 block">{it.item}</span>
                                {matchedRes && (
                                  <span className={`text-[10px] mt-0.5 block ${isShortage ? 'text-rose-500 font-semibold' : 'text-slate-400 font-mono'}`}>
                                    Available Stock: {matchedRes.stock} {matchedRes.unit}
                                    {isShortage && ' (Low stock alert!)'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                                {it.quantity.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Assigned Partners Telemetry (if assigned) */}
                {activeRequest.assignedNgoName && (
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3.5 text-xs text-slate-600">
                    <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wide block">Dispatched Responder Fleet</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase">NGO Partnership</span>
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-900 mt-0.5">
                          <Users className="h-4 w-4 text-indigo-600" />
                          <span className="truncate">{activeRequest.assignedNgoName}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase">Volunteer Officer</span>
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-900 mt-0.5">
                          <Heart className="h-4 w-4 text-emerald-600 animate-pulse" />
                          <span className="truncate">{activeRequest.assignedVolunteerName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* State Machine Action Controls */}
                {isAuthority && (
                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    
                    {activeRequest.status === 'Pending' && (
                      <button
                        onClick={() => handleApproveRequest(activeRequest.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm border border-emerald-700 transition-all cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                        <span>Allocate Reserves & Approve Requisition</span>
                      </button>
                    )}

                    {activeRequest.status === 'Approved' && (
                      <button
                        onClick={() => setShowDispatchModal(activeRequest)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm border border-indigo-700 transition-all cursor-pointer"
                      >
                        <Truck className="h-4 w-4" />
                        <span>Initialize Supply Handoff Convoy</span>
                      </button>
                    )}

                    {activeRequest.status === 'Assigned' && (
                      <div className="p-3 bg-blue-50 border border-blue-150 text-blue-800 rounded-lg text-xs font-medium flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Convoy details registered. Responder is currently mobilizing cargo. Transport waypoint can be managed in delivery tracking.</span>
                      </div>
                    )}

                    {activeRequest.status === 'Completed' && (
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <span>Disaster relief ledger indicates this requisition is fully fulfilled and stocked.</span>
                      </div>
                    )}

                  </div>
                )}

              </motion.div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                <GitPullRequest className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <span>Select a resource requisition on the left to examine detailed allocation metrics and launch logistics convoys.</span>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* DISPATCH CONVOY WORKFLOW DIALOG */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Initialize Dispatch Convoy</h3>
              <button onClick={() => setShowDispatchModal(null)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 mt-4 text-xs">
              
              <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-indigo-850 space-y-1">
                <span className="font-bold block">Consolidated Order Requisition:</span>
                <span className="block font-mono text-[10px]">Shelter Target: {showDispatchModal.shelterName}</span>
                <span className="block font-mono text-[10px]">Supply items: {showDispatchModal.items.length} categories allocated</span>
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
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 cursor-pointer"
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
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 cursor-pointer"
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
                  onClick={() => setShowDispatchModal(null)}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isDispatching}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white px-4 py-2 rounded-lg font-semibold shadow-sm flex items-center space-x-1 cursor-pointer border border-indigo-700"
                >
                  {isDispatching && <Loader className="h-3.5 w-3.5 animate-spin" />}
                  <span>Verify and Launch Handoff</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CREATE REQUISITION DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase font-mono flex items-center space-x-1.5">
                <GitPullRequest className="h-4.5 w-4.5 text-rose-600 animate-pulse" />
                <span>File Emergency Requisition Request</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequisitionSubmit} className="space-y-4 mt-4 text-xs">
              
              {/* Select Target Shelter */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wide">
                  Target Shelter Relief Camp <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={reqShelterId}
                  onChange={(e) => setReqShelterId(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 px-3 cursor-pointer"
                >
                  {shelters.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wide">
                  Priority Rating Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value as RequestPriority)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-2 px-3 cursor-pointer"
                >
                  <option value="Critical">Critical (Immediate dispatch needed)</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Items Addition Panel */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-[10px] font-bold font-mono uppercase text-slate-500 tracking-wider">Add Supply Requisition Item Category</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  
                  {/* Select supply category */}
                  <div className="sm:col-span-8 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase">Select Available Item</label>
                    <select
                      value={currentSelectedResource}
                      onChange={(e) => setCurrentSelectedResource(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-3 cursor-pointer text-xs"
                    >
                      <option value="">Choose item pattern...</option>
                      {resources.map(r => (
                        <option key={r.id} value={r.name}>{r.name} ({r.stock} on shelf)</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase">Demand Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={currentQuantity}
                      onChange={(e) => setCurrentQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-slate-200 rounded-lg py-1 px-3 text-xs font-mono font-bold"
                    />
                  </div>

                  {/* Add button */}
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddFormItem}
                      disabled={!currentSelectedResource}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-1.5 rounded-lg flex items-center justify-center cursor-pointer border border-indigo-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wide">
                  Configured Requisition Cart items
                </label>
                {reqItems.length === 0 ? (
                  <div className="border border-dashed border-slate-300 rounded-lg p-5 text-center text-slate-400">
                    No items loaded into requisition basket yet. Specify items above and click the (+) button.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[220px] overflow-y-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-[9px] font-mono font-bold text-slate-500 uppercase">
                          <th className="py-1.5 px-3">Item Category Description</th>
                          <th className="py-1.5 px-3 text-right">Quantity</th>
                          <th className="py-1.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {reqItems.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 font-mono">
                            <td className="py-2 px-3 font-sans font-medium text-slate-900">{it.item}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">{it.quantity.toLocaleString()}</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveFormItem(idx)}
                                className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-slate-100 cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || reqItems.length === 0}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-75 text-white px-5 py-2 rounded-lg font-semibold shadow-sm flex items-center space-x-1.5 cursor-pointer border border-rose-700"
                >
                  {isSubmitting && <Loader className="h-3.5 w-3.5 animate-spin" />}
                  <span>Submit Requisition</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
