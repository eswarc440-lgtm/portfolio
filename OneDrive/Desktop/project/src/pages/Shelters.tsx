/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shelter, RequestPriority } from '../types';
import { 
  Home, 
  Plus, 
  MapPin, 
  Phone, 
  Activity, 
  Battery, 
  GlassWater, 
  Apple, 
  Stethoscope, 
  Edit, 
  Trash2, 
  X,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';
import { LocationPickerModal } from '../components/LocationPickerModal';

export const Shelters: React.FC = () => {
  const { 
    shelters, 
    addShelter, 
    updateShelter, 
    deleteShelter, 
    addResourceRequest,
    currentUser 
  } = useApp();

  const [activeShelter, setActiveShelter] = useState<Shelter | null>(shelters[0] || null);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOccupancyModal, setShowOccupancyModal] = useState(false);

  // Form: Shelter Registry
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(500);
  const [medical, setMedical] = useState(true);
  const [food, setFood] = useState(true);
  const [water, setWater] = useState(true);
  const [electricity, setElectricity] = useState(true);
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  
  // Location Picker States
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [customCoords, setCustomCoords] = useState<{ x: number, y: number } | null>(null);

  const gpsToMapCoordinates = (lat: number, lon: number): { x: number; y: number } => {
    const centerLat = 16.5062;
    const centerLon = 80.6480;
    const x = Math.max(0, Math.min(100, (lon - centerLon) / 0.0008 + 50));
    const y = Math.max(0, Math.min(100, (lat - centerLat) / 0.0008 + 50));
    return { x, y };
  };

  const handleLocationSelect = (loc: { latitude: number; longitude: number; address: string; city: string }) => {
    setLocation(loc.address || `${loc.city || 'Vijayawada'}`);
    const mapped = gpsToMapCoordinates(loc.latitude, loc.longitude);
    setCustomCoords(mapped);
  };

  // Form: Quick occupancy update
  const [newOccupancy, setNewOccupancy] = useState(0);

  // Form: File Requisition Request
  const [requestPriority, setRequestPriority] = useState<RequestPriority>('High');
  const [mealsQty, setMealsQty] = useState(1000);
  const [waterQty, setWaterQty] = useState(2000);
  const [medsQty, setMedsQty] = useState(100);
  const [blanketsQty, setBlanketsQty] = useState(500);

  const isAuthorized = currentUser ? ['Super Admin', 'Disaster Management Authority', 'NGO', 'Shelter Manager'].includes(currentUser.role) : false;

  const handleOpenEditModal = (item: Shelter) => {
    setEditingShelter(item);
    setName(item.name);
    setCapacity(item.capacity);
    setMedical(item.medicalFacilities);
    setFood(item.foodAvailability);
    setWater(item.waterAvailability);
    setElectricity(item.electricity);
    setContact(item.contact);
    setLocation(item.location);
    setCustomCoords(item.coordinates || null);
    setShowEditModal(true);
  };

  const handleEditShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShelter || !name || !location || !contact) return;

    const beds = capacity - editingShelter.occupancy;
    const status: Shelter['status'] = beds <= 0 ? 'Full' : 'Active';

    const updated: Shelter = {
      ...editingShelter,
      name,
      capacity,
      availableBeds: Math.max(0, beds),
      status,
      medicalFacilities: medical,
      foodAvailability: food,
      waterAvailability: water,
      electricity,
      contact,
      location,
      coordinates: customCoords || editingShelter.coordinates
    };

    await updateShelter(updated);
    if (activeShelter?.id === editingShelter.id) {
      setActiveShelter(updated);
    }
    setShowEditModal(false);
    setEditingShelter(null);
  };

  const handleRegisterShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !contact) return;

    await addShelter({
      name,
      capacity,
      medicalFacilities: medical,
      foodAvailability: food,
      waterAvailability: water,
      electricity,
      contact,
      location,
      coordinates: customCoords || { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 }
    });

    setShowAddModal(false);
    // Reset Form
    setName('');
    setCapacity(500);
    setMedical(true);
    setFood(true);
    setWater(true);
    setElectricity(true);
    setContact('');
    setLocation('');
    setCustomCoords(null);
  };

  const handleUpdateOccupancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShelter) return;

    await updateShelter({
      ...activeShelter,
      occupancy: Number(newOccupancy)
    });

    setShowOccupancyModal(false);
    // Refresh local selected view
    setActiveShelter(prev => prev ? { ...prev, occupancy: Number(newOccupancy) } : null);
  };

  const handleFileRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShelter) return;

    const itemsList = [];
    if (mealsQty > 0) itemsList.push({ item: 'Ready-to-Eat Emergency Meals & Dry Rations', quantity: Number(mealsQty) });
    if (waterQty > 0) itemsList.push({ item: 'Potable Water Packs (1L Packaged Cartons)', quantity: Number(waterQty) });
    if (medsQty > 0) itemsList.push({ item: 'Standard Trauma Kit & Surgical Packs', quantity: Number(medsQty) });
    if (blanketsQty > 0) itemsList.push({ item: 'Thermal Blankets & Ground Canvas Sheets', quantity: Number(blanketsQty) });

    if (itemsList.length === 0) {
      alert('Please select at least one supply category quantity to file a resource request.');
      return;
    }

    await addResourceRequest(activeShelter.id, itemsList, requestPriority);
    setShowRequestModal(false);
    alert(`Resource request submitted successfully for ${activeShelter.name}. Logistics dispatch has been notified.`);
  };

  const handleDeleteShelter = async (id: string) => {
    if (confirm('Are you absolutely sure you want to retire this shelter registry?')) {
      await deleteShelter(id);
      if (activeShelter?.id === id) {
        const remaining = shelters.filter(s => s.id !== id);
        setActiveShelter(remaining[0] || null);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Pane: Shelters Grid List */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Evacuation Shelters Hub</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Humanitarian shelter grids status.</p>
          </div>
          {isAuthorized && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Open Shelter</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {shelters.map(item => {
            const isActive = activeShelter?.id === item.id;
            const occupancyRate = Math.round((item.occupancy / item.capacity) * 100);
            return (
              <div 
                key={item.id}
                onClick={() => { setActiveShelter(item); setNewOccupancy(item.occupancy); }}
                className={`border rounded-xl p-4 bg-white hover:shadow-md transition-all cursor-pointer relative group ${
                  isActive ? 'border-rose-500 shadow-md bg-rose-50/5' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-slate-300" />
                      <span className="truncate max-w-[200px]">{item.location}</span>
                    </p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    item.status === 'Full' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Occupancy: {item.occupancy} / {item.capacity} beds</span>
                    <span>{occupancyRate}% Load</span>
                  </div>
                  {/* Progress Load Bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${occupancyRate >= 90 ? 'bg-amber-500' : 'bg-rose-600'}`}
                      style={{ width: `${Math.min(100, occupancyRate)}%` }}
                    ></div>
                  </div>
                </div>

                 {isAuthorized && (
                  <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-white p-1 rounded-xl shadow border border-slate-200 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                      className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Shelter"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteShelter(item.id); }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                      title="Delete Shelter"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Detail display & requests */}
      <div className="lg:col-span-7">
        {activeShelter ? (
          <div className="space-y-6">
            
            {/* Shelter Stats & status */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-extrabold text-slate-950 tracking-tight">{activeShelter.name}</h2>
                  <span className="text-[9px] font-mono font-bold uppercase text-slate-400 mt-1 block">
                    Shelter ID: <span className="text-slate-600">#{activeShelter.id}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowOccupancyModal(true)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Update Beds Load
                  </button>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>File Requisition</span>
                  </button>
                </div>
              </div>

              {/* Physical details grids */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Beds</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">{activeShelter.capacity}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Occupied</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">{activeShelter.occupancy}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Vacant</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">{activeShelter.availableBeds}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Status</span>
                  <span className={`text-[11px] font-bold mt-2.5 inline-block ${activeShelter.status === 'Full' ? 'text-amber-600' : 'text-emerald-650'}`}>
                    {activeShelter.status}
                  </span>
                </div>

              </div>

              {/* Support Infrastructure Toggles checkboxes representation */}
              <div className="mt-6 border-t border-slate-150 pt-5">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider mb-3">Support Infrastructure Grid</h4>
                <div className="grid grid-cols-2 gap-4">
                  
                  <div className="p-3.5 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Battery className={`h-4.5 w-4.5 ${activeShelter.electricity ? 'text-amber-500' : 'text-slate-350'}`} />
                      <span className="text-xs font-semibold text-slate-800">Electricity / Backups</span>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${activeShelter.electricity ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  </div>

                  <div className="p-3.5 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <GlassWater className={`h-4.5 w-4.5 ${activeShelter.waterAvailability ? 'text-sky-500' : 'text-slate-350'}`} />
                      <span className="text-xs font-semibold text-slate-800">Potable Water Main</span>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${activeShelter.waterAvailability ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  </div>

                  <div className="p-3.5 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Apple className={`h-4.5 w-4.5 ${activeShelter.foodAvailability ? 'text-rose-500' : 'text-slate-350'}`} />
                      <span className="text-xs font-semibold text-slate-800">Catering Kitchen</span>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${activeShelter.foodAvailability ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  </div>

                  <div className="p-3.5 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Stethoscope className={`h-4.5 w-4.5 ${activeShelter.medicalFacilities ? 'text-emerald-500' : 'text-slate-350'}`} />
                      <span className="text-xs font-semibold text-slate-800">First-Aid Triage Station</span>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${activeShelter.medicalFacilities ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  </div>

                </div>
              </div>

              {/* Contacts info */}
              <div className="mt-6 pt-5 border-t border-slate-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 font-mono">
                <span className="flex items-center space-x-1">
                  <Phone className="h-4 w-4 text-slate-300" />
                  <span>EMERGENCY CONTACT: {activeShelter.contact}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-slate-300" />
                  <span>GPS COORDS: {activeShelter.coordinates.x.toFixed(2)}% N / {activeShelter.coordinates.y.toFixed(2)}% W</span>
                </span>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            Select a shelter site from the list to load resource monitoring details.
          </div>
        )}
      </div>

      {/* MODAL: Register New Shelter */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Register New Evacuation Shelter</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleRegisterShelter} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Shelter Facility Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sarasota Sports Gymnasium Hub" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Bed Capacity</label>
                  <input 
                    type="number" 
                    required
                    value={capacity} 
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Operations Hotline</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+1 (555) 012-3456" 
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Coordinates</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    readOnly
                    placeholder="Click map pin to select location..." 
                    value={location} 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none cursor-pointer text-xs"
                    onClick={() => setIsLocPickerOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsLocPickerOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    title="Select on Interactive GIS Map"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Infrastructure checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Infrastructure Status Checklist</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 border border-slate-100 p-2.5 rounded-lg hover:bg-slate-50/50 cursor-pointer">
                    <input type="checkbox" checked={electricity} onChange={(e) => setElectricity(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500" />
                    <span>Grid Electricity & Backups Active</span>
                  </label>

                  <label className="flex items-center space-x-2 border border-slate-100 p-2.5 rounded-lg hover:bg-slate-50/50 cursor-pointer">
                    <input type="checkbox" checked={water} onChange={(e) => setWater(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500" />
                    <span>Sealed Potable Water Mains Available</span>
                  </label>

                  <label className="flex items-center space-x-2 border border-slate-100 p-2.5 rounded-lg hover:bg-slate-50/50 cursor-pointer">
                    <input type="checkbox" checked={food} onChange={(e) => setFood(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500" />
                    <span>Catering Kitchen Fully Stocked</span>
                  </label>

                  <label className="flex items-center space-x-2 border border-slate-100 p-2.5 rounded-lg hover:bg-slate-50/50 cursor-pointer">
                    <input type="checkbox" checked={medical} onChange={(e) => setMedical(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500" />
                    <span>First-Aid Triage Stations online</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm"
                >
                  Register Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingShelter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Modify Shelter Parameters</h3>
              <button onClick={() => { setShowEditModal(false); setEditingShelter(null); }} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleEditShelter} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shelter Hub Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Downtown Central Arena" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Bed Capacity</label>
                  <input 
                    type="number" 
                    required
                    min={50}
                    value={capacity} 
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Operations Hotline</label>
                <input 
                  type="text" 
                  required
                  placeholder="+1 (555) 012-3456" 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Location Address</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 500 Grand Ave, Sector 4" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Coordinates</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    readOnly
                    placeholder="Click map pin to select location..." 
                    value={customCoords ? `X: ${customCoords.x.toFixed(2)}, Y: ${customCoords.y.toFixed(2)}` : ''} 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none cursor-pointer text-xs"
                    onClick={() => setIsLocPickerOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsLocPickerOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    title="Select on Interactive GIS Map"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">Infrastructure Status Checklist</label>
                <div className="grid grid-cols-2 gap-3 font-medium">
                  <label className="flex items-center space-x-2 border border-slate-100 p-2.5 rounded-lg hover:bg-slate-50/50 cursor-pointer">
                    <input type="checkbox" checked={electricity} onChange={(e) => setElectricity(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500" />
                    <span>Grid Electricity & Backups Active</span>
                  </label>

                  <label className="flex items-center space-x-2 border border-slate-100 p-2.5 rounded-lg hover:bg-slate-50/50 cursor-pointer">
                    <input type="checkbox" checked={water} onChange={(e) => setWater(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500" />
                    <span>Sealed Potable Water Mains Available</span>
                  </label>

                  <label className="flex items-center space-x-2 border border-slate-100 p-2.5 rounded-lg hover:bg-slate-50/50 cursor-pointer">
                    <input type="checkbox" checked={food} onChange={(e) => setFood(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500" />
                    <span>Catering Kitchen Fully Stocked</span>
                  </label>

                  <label className="flex items-center space-x-2 border border-slate-100 p-2.5 rounded-lg hover:bg-slate-50/50 cursor-pointer">
                    <input type="checkbox" checked={medical} onChange={(e) => setMedical(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500" />
                    <span>First-Aid Triage Stations online</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingShelter(null); }}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: File Supply Request */}
      {showRequestModal && activeShelter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">File Emergency Requisition Request</h3>
              <button onClick={() => setShowRequestModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleFileRequest} className="space-y-4 mt-4 text-xs">
              <div className="bg-rose-50 p-3.5 border border-rose-100 rounded-xl text-rose-800">
                <span className="font-bold">Target Destination Shelter:</span> {activeShelter.name}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Incident Requisition Priority</label>
                <select 
                  value={requestPriority} 
                  onChange={(e) => setRequestPriority(e.target.value as RequestPriority)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="Critical">Critical Priority (Immediate dispatch)</option>
                  <option value="High">High Priority (Within 4 hours)</option>
                  <option value="Medium">Medium Priority (Within 12 hours)</option>
                  <option value="Low">Low Priority (Routine restock)</option>
                </select>
              </div>

              <div className="space-y-3.5 pt-2">
                <h4 className="font-bold text-slate-800 uppercase font-mono tracking-wider">Demanded Quantities</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Emergency Meals (MREs)</label>
                    <input 
                      type="number" 
                      value={mealsQty} 
                      onChange={(e) => setMealsQty(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Sealed Potable Water (Liters)</label>
                    <input 
                      type="number" 
                      value={waterQty} 
                      onChange={(e) => setWaterQty(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Standard Trauma Kits</label>
                    <input 
                      type="number" 
                      value={medsQty} 
                      onChange={(e) => setMedsQty(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Thermal Insulation Blankets</label>
                    <input 
                      type="number" 
                      value={blanketsQty} 
                      onChange={(e) => setBlanketsQty(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm"
                >
                  Submit Demand Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Update Occupancy */}
      {showOccupancyModal && activeShelter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Update Beds Occupancy</h3>
              <button onClick={() => setShowOccupancyModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOccupancySubmit} className="space-y-4 mt-4 text-xs">
              <div className="bg-sky-50 p-3 border border-sky-100 rounded-xl text-sky-850">
                <span className="font-bold">Total Hub Capacity:</span> {activeShelter.capacity} cots
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Occupied Beds Count</label>
                <input 
                  type="number" 
                  required
                  min={0}
                  max={activeShelter.capacity}
                  value={newOccupancy} 
                  onChange={(e) => setNewOccupancy(Number(e.target.value))}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowOccupancyModal(false)}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm"
                >
                  Update Load Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLocPickerOpen && (
        <LocationPickerModal
          isOpen={isLocPickerOpen}
          onClose={() => setIsLocPickerOpen(false)}
          onSelect={handleLocationSelect}
          initialLat={customCoords ? (16.5062 + (customCoords.y - 50) * 0.0008) : 16.5062}
          initialLon={customCoords ? (80.6480 + (customCoords.x - 50) * 0.0008) : 80.6480}
          title="Select Shelter Coordinates"
        />
      )}

    </div>
  );
};
