/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Volunteer } from '../types';
import { Plus, Heart, Phone, ShieldCheck, Car, Trash2, X, MapPin, Edit } from 'lucide-react';
import { LocationPickerModal } from '../components/LocationPickerModal';

export const Volunteers: React.FC = () => {
  const { volunteers, registerVolunteer, updateVolunteer, deleteVolunteer, currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  
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

  const handleOpenEditModal = (item: Volunteer) => {
    setEditingVolunteer(item);
    setName(item.name);
    setPhone(item.phone);
    setVehicle(item.vehicle);
    setVehicleNo(item.vehicleNo);
    setCurrentLocation(item.coordinates ? `GIS Point (X: ${item.coordinates.x.toFixed(1)}, Y: ${item.coordinates.y.toFixed(1)})` : '');
    setEmergencyContact(item.emergencyContact);
    setCustomCoords(item.coordinates || null);
    setShowEditModal(true);
  };

  const handleEditVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolunteer || !name || !phone) return;

    const updated: Volunteer = {
      ...editingVolunteer,
      name,
      phone,
      vehicle,
      vehicleNo,
      emergencyContact,
      coordinates: customCoords || editingVolunteer.coordinates
    };

    await updateVolunteer(updated);
    setShowEditModal(false);
    setEditingVolunteer(null);
    // Reset Form
    setName('');
    setPhone('');
    setVehicle('');
    setVehicleNo('');
    setCurrentLocation('');
    setEmergencyContact('');
    setCustomCoords(null);
  };

  const handleDeleteVolunteer = async (id: string) => {
    if (confirm('Are you absolutely sure you want to de-register and dismiss this volunteer responder from relief operations?')) {
      await deleteVolunteer(id);
    }
  };

  const handleLocationSelect = (loc: { latitude: number; longitude: number; address: string; city: string }) => {
    setCurrentLocation(loc.address || `${loc.city || 'Vijayawada'}`);
    const mapped = gpsToMapCoordinates(loc.latitude, loc.longitude);
    setCustomCoords(mapped);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !vehicle || !vehicleNo || !currentLocation || !emergencyContact) return;

    await registerVolunteer({
      name,
      phone,
      vehicle,
      vehicleNo,
      currentLocation,
      emergencyContact,
      coordinates: customCoords || { x: 50 + (Math.random() - 0.5) * 30, y: 50 + (Math.random() - 0.5) * 30 }
    });

    setShowAddModal(false);
    // Reset Form
    setName('');
    setPhone('');
    setVehicle('');
    setVehicleNo('');
    setCurrentLocation('');
    setEmergencyContact('');
    setCustomCoords(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Volunteer Dispatch Network</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Enrolled local mobile responders ready for supply chain dispatches.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Enlist Volunteer</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {volunteers.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">{item.name}</h4>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
                    Responder • ID: {item.id}
                  </span>
                </div>
              </div>

              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                item.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-205' :
                item.availability === 'Busy' ? 'bg-amber-50 text-amber-700 border-amber-205' :
                'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {item.availability}
              </span>
            </div>             {/* Absolute Action Buttons */}
            {currentUser && ['Super Admin', 'Disaster Management Authority', 'NGO', 'Shelter Manager'].includes(currentUser.role) && (
              <div className="absolute top-14 right-5 flex items-center space-x-1.5 bg-white p-1 rounded-xl shadow border border-slate-200 z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                  className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit Responder"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteVolunteer(item.id); }}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                  title="Delete Responder"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Middle info */}
            <div className="grid grid-cols-2 gap-2 mt-5 border-y border-slate-100 py-3 font-mono text-[10px] text-slate-500">
              <div>
                <span className="block font-sans text-slate-400 uppercase text-[9px] tracking-wide">Tasks Completed</span>
                <span className="font-extrabold text-sm text-slate-900 block mt-0.5">{item.completedTasks} deliveries</span>
              </div>
              <div>
                <span className="block font-sans text-slate-400 uppercase text-[9px] tracking-wide">Feedback Rating</span>
                <span className="font-extrabold text-sm text-amber-600 block mt-0.5">{item.rating.toFixed(1)} ★ Rating</span>
              </div>
            </div>

            {/* Vehicle & Contacts */}
            <div className="mt-4 space-y-1.5 text-xs text-slate-500 font-sans">
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-slate-350" />
                <span>Cargo: <span className="font-bold text-slate-700">{item.vehicle}</span> (<span className="font-mono text-[10px] font-bold">{item.vehicleNo}</span>)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-slate-350" />
                <span>Contact: {item.phone}</span>
              </div>
            </div>

            {/* Emergency Info footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <div className="flex items-center space-x-1.5 text-emerald-600 font-bold font-sans">
                <ShieldCheck className="h-4 w-4" />
                <span>Emergency Contact Reg</span>
              </div>
              <span className="text-slate-400 truncate max-w-[130px]" title={item.emergencyContact}>
                {item.emergencyContact}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Enlist Volunteer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Enlist Emergency Mobile Responder</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Responder Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Alex Mercer Logistics" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Personal Phone Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+1 (415) 555-0190" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Ice Contact</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Sarah Mercer (+1 415-555)" 
                    value={emergencyContact} 
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Specification</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ford F-350 Truck" 
                    value={vehicle} 
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-lg p-2 focus:outline-none transition-all duration-200 hover:border-slate-300 shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle License No</label>
                  <input 
                    type="text" 
                    required
                    placeholder="EMER-492" 
                    value={vehicleNo} 
                    onChange={(e) => setVehicleNo(e.target.value)}
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
                    value={currentLocation} 
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
                  className="bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-rose-600/10 hover:shadow-lg hover:shadow-rose-600/20 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
                >
                  Enlist Responder
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
          title="Select Responder Initial Coordinates"
        />
      )}

      {showEditModal && editingVolunteer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Modify Responder Parameters</h3>
              <button onClick={() => { setShowEditModal(false); setEditingVolunteer(null); }} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleEditVolunteerSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Responder Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Alex Mercer Logistics" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Personal Phone Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+1 (415) 555-0190" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Ice Contact</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Sarah Mercer (+1 415-555)" 
                    value={emergencyContact} 
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Specification</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ford F-350 Truck" 
                    value={vehicle} 
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-lg p-2 focus:outline-none transition-all duration-200 hover:border-slate-300 shadow-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle License No</label>
                  <input 
                    type="text" 
                    required
                    placeholder="EMER-492" 
                    value={vehicleNo} 
                    onChange={(e) => setVehicleNo(e.target.value)}
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
                    value={currentLocation} 
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

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingVolunteer(null); }}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-rose-600/10 hover:shadow-lg hover:shadow-rose-600/20 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
