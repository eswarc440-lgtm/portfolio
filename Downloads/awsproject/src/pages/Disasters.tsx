/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Disaster, DisasterType, SeverityLevel, DisasterStatus } from '../types';
import { 
  AlertOctagon, 
  MapPin, 
  Sparkles, 
  Clock, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronRight, 
  X,
  ExternalLink,
  ShieldCheck,
  Send,
  Loader
} from 'lucide-react';
import { LocationPickerModal } from '../components/LocationPickerModal';

export const Disasters: React.FC = () => {
  const { 
    disasters, 
    addDisaster, 
    updateDisaster, 
    deleteDisaster, 
    currentUser,
    getAIRecommendation,
    getAISimulation
  } = useApp();

  const [activeDisaster, setActiveDisaster] = useState<Disaster | null>(disasters[0] || null);
  
  // Modal toggle state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DisasterType>('Flood');
  const [severity, setSeverity] = useState<SeverityLevel>('High');
  const [location, setLocation] = useState('');
  const [affected, setAffected] = useState<number>(1000);
  const [description, setDescription] = useState('');
  
  // Location Picker States
  const [isLocPickerOpen, setIsLocPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'add' | 'edit'>('add');
  const [customCoords, setCustomCoords] = useState<{ x: number, y: number } | null>(null);

  // Conversion of real coordinates back to internal percentage-based offsets
  const gpsToMapCoordinates = (lat: number, lon: number): { x: number; y: number } => {
    const centerLat = 16.5062;
    const centerLon = 80.6480;
    const x = Math.max(0, Math.min(100, (lon - centerLon) / 0.0008 + 50));
    const y = Math.max(0, Math.min(100, (lat - centerLat) / 0.0008 + 50));
    return { x, y };
  };

  const handleLocationSelect = (loc: { latitude: number; longitude: number; address: string; city: string }) => {
    const addrText = loc.address || `${loc.city || 'Vijayawada'}`;
    setLocation(addrText);
    const mapped = gpsToMapCoordinates(loc.latitude, loc.longitude);
    setCustomCoords(mapped);
  };
  
  // Editing state
  const [editingId, setEditingId] = useState('');

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{
    priority: string;
    recommendedMeals: number;
    recommendedWaterLiters: number;
    recommendedMedicalKits: number;
    recommendedBlankets: number;
    ngoActionPlan: string;
    volunteerInstructions: string;
    riskWarning: string;
  } | null>(null);

  const [simLoading, setSimLoading] = useState(false);
  const [simReport, setSimReport] = useState<{
    projectedSeverity: string;
    next12HoursOutlook: string;
    criticalShortages: string[];
    suggestedEmergencyTasks: string[];
  } | null>(null);

  const isAuthorized = currentUser ? ['Super Admin', 'Disaster Management Authority', 'NGO', 'Shelter Manager', 'Volunteer'].includes(currentUser.role) : false;

  const resetForm = () => {
    setTitle('');
    setType('Flood');
    setSeverity('High');
    setLocation('');
    setAffected(1000);
    setDescription('');
    setEditingId('');
    setCustomCoords(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: Disaster) => {
    setEditingId(item.id);
    setTitle(item.title);
    setType(item.type);
    setSeverity(item.severity);
    setLocation(item.location);
    setAffected(item.affected);
    setDescription(item.description);
    setCustomCoords(item.coordinates || null);
    setShowEditModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    await addDisaster({
      title,
      type,
      severity,
      location,
      affected,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      description,
      coordinates: customCoords || { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 }
    });

    setShowAddModal(false);
    resetForm();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !editingId) return;

    const current = disasters.find(d => d.id === editingId);
    if (!current) return;

    await updateDisaster({
      ...current,
      title,
      type,
      severity,
      location,
      affected,
      description,
      coordinates: customCoords || current.coordinates
    });

    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you absolutely sure you want to retire this disaster incident from active operations registers?')) {
      await deleteDisaster(id);
      if (activeDisaster?.id === id) {
        const remaining = disasters.filter(d => d.id !== id);
        setActiveDisaster(remaining[0] || null);
      }
    }
  };

  // Triggers Gemini Logistics Advisor API
  const handleTriggerAI = async (item: Disaster) => {
    setAiLoading(true);
    setAiReport(null);
    setSimReport(null);
    try {
      const data = await getAIRecommendation(item);
      if (data) {
        setAiReport(data);
      }
    } catch (err) {
      alert('Failed to connect to the Gemini Advisor node.');
    } finally {
      setAiLoading(false);
    }
  };

  // Triggers Gemini Simulation API
  const handleTriggerSim = async (item: Disaster) => {
    setSimLoading(true);
    setAiReport(null);
    setSimReport(null);
    try {
      const data = await getAISimulation(item);
      if (data) {
        setSimReport(data);
      }
    } catch (err) {
      alert('Failed to connect to the Gemini Simulation node.');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Pane: Registry List */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Disaster Incidents Registry</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Active disaster events reported in sector.</p>
          </div>
          {isAuthorized && (
            <button 
              onClick={handleOpenAdd}
              className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Declare Disaster</span>
            </button>
          )}
        </div>

        <div className="space-y-3.5">
          {disasters.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
              No active disaster incidents reported.
            </div>
          ) : (
            disasters.map(item => {
              const isActive = activeDisaster?.id === item.id;
              return (
                <div 
                  key={item.id}
                  onClick={() => { setActiveDisaster(item); setAiReport(null); setSimReport(null); }}
                  className={`border rounded-xl p-4 bg-white hover:shadow-md transition-all cursor-pointer relative group ${
                    isActive ? 'border-rose-500 shadow-md bg-rose-50/5' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        item.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                        item.severity === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-slate-50 text-slate-600 border-slate-150'
                      }`}>
                        {item.severity} Severity
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-2 tracking-tight">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">{item.type}</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-300" />
                      <span className="truncate max-w-[150px]">{item.location}</span>
                    </span>
                    <span>Start: {item.startDate}</span>
                  </div>

                  {isAuthorized && (
                    <div className="absolute bottom-12 right-4 flex items-center space-x-1.5 bg-white p-1 rounded-xl shadow border border-slate-200 z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                        className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Edit Incident"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                        title="Delete Incident"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Detail view and Gemini Advisory */}
      <div className="lg:col-span-7 space-y-6">
        {activeDisaster ? (
          <div className="space-y-6">
            
            {/* Core Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-950 tracking-tight flex items-center space-x-2">
                <AlertOctagon className="h-5 w-5 text-rose-600" />
                <span>{activeDisaster.title}</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mt-4 border-y border-slate-100 py-3.5 font-mono text-[10px] text-slate-500">
                <div>
                  <span className="block font-sans text-slate-400">IMPACT TYPE / THREAT INDEX</span>
                  <span className="font-bold text-xs text-slate-800 block mt-0.5">{activeDisaster.type}</span>
                </div>
                <div>
                  <span className="block font-sans text-slate-400">AFFECTED REGIONAL POPULATION</span>
                  <span className="font-bold text-xs text-slate-800 block mt-0.5">{activeDisaster.affected.toLocaleString()} individuals</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-[10px] font-bold text-slate-400 font-mono uppercase">Incident Narrative Report</h4>
                <p className="text-xs text-slate-650 leading-relaxed mt-1.5">{activeDisaster.description}</p>
              </div>

              {/* Gemini Trigger buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                <button
                  disabled={aiLoading}
                  onClick={() => handleTriggerAI(activeDisaster)}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-sm shadow-indigo-900/10 cursor-pointer"
                >
                  {aiLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Ask Gemini Logistics Advisor</span>
                </button>

                <button
                  disabled={simLoading}
                  onClick={() => handleTriggerSim(activeDisaster)}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-slate-100 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center space-x-1.5 shadow-sm border border-slate-800 cursor-pointer"
                >
                  {simLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  <span>Simulate 12hr Projection</span>
                </button>
              </div>
            </div>

            {/* AI Advisor Response panel */}
            {aiReport && (
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 shadow-sm animate-in fade-in-50 duration-200">
                <div className="flex items-center space-x-2 text-indigo-800 mb-4">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider">Gemini Resource Allocation Blueprint</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="p-3 bg-white border border-indigo-100 rounded-lg text-center font-mono">
                    <span className="text-[10px] text-indigo-400 font-sans block">Emergency Meals</span>
                    <span className="text-sm font-black text-indigo-950 block mt-0.5">{aiReport.recommendedMeals.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 font-sans block">MRE units</span>
                  </div>

                  <div className="p-3 bg-white border border-indigo-100 rounded-lg text-center font-mono">
                    <span className="text-[10px] text-indigo-400 font-sans block">Potable Water</span>
                    <span className="text-sm font-black text-indigo-950 block mt-0.5">{aiReport.recommendedWaterLiters.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 font-sans block">Liters</span>
                  </div>

                  <div className="p-3 bg-white border border-indigo-100 rounded-lg text-center font-mono">
                    <span className="text-[10px] text-indigo-400 font-sans block">Medical Packs</span>
                    <span className="text-sm font-black text-indigo-950 block mt-0.5">{aiReport.recommendedMedicalKits.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 font-sans block">Standard kits</span>
                  </div>

                  <div className="p-3 bg-white border border-indigo-100 rounded-lg text-center font-mono">
                    <span className="text-[10px] text-indigo-400 font-sans block">Thermal Blankets</span>
                    <span className="text-sm font-black text-indigo-950 block mt-0.5">{aiReport.recommendedBlankets.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 font-sans block">Insulated units</span>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed border-t border-indigo-100/70 pt-4">
                  <div>
                    <h5 className="font-bold text-indigo-900 flex items-center space-x-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      <span>NGO Corridor Action Plan</span>
                    </h5>
                    <p className="mt-1 font-sans">{aiReport.ngoActionPlan}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-indigo-900 flex items-center space-x-1.5">
                      <Send className="h-4 w-4" />
                      <span>Volunteer Field Directives</span>
                    </h5>
                    <p className="mt-1 font-sans">{aiReport.volunteerInstructions}</p>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                    <h5 className="font-bold text-rose-900 flex items-center space-x-1">
                      <AlertOctagon className="h-3.5 w-3.5" />
                      <span>Secondary Vulnerability Threat Warning</span>
                    </h5>
                    <p className="mt-1 text-[11px] font-sans leading-relaxed">{aiReport.riskWarning}</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Simulation Response panel */}
            {simReport && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-200 animate-in fade-in-50 duration-200 font-sans">
                <div className="flex items-center space-x-2 text-rose-400 mb-4">
                  <Clock className="h-5 w-5" />
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider">12-Hour Climatic Projection Model</h3>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">PROJECTED THREAT INDEX</span>
                  <span className={`inline-block text-xs font-extrabold mt-1 px-2.5 py-0.5 rounded border ${
                    simReport.projectedSeverity === 'Critical' ? 'bg-rose-950 text-rose-400 border-rose-900' : 'bg-orange-950 text-orange-400 border-orange-900'
                  }`}>
                    {simReport.projectedSeverity} Severity Level
                  </span>
                </div>

                <div className="mt-4 border-t border-slate-850 pt-4">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Atmospheric & Operations Forecast</span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{simReport.next12HoursOutlook}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t border-slate-850 pt-4 text-xs">
                  <div>
                    <h5 className="font-bold text-rose-400 flex items-center space-x-1">
                      <AlertOctagon className="h-3.5 w-3.5" />
                      <span>Predicted Logistics Shortages</span>
                    </h5>
                    <ul className="mt-2 space-y-1.5 font-mono text-[11px] text-slate-400 list-inside list-disc">
                      {simReport.criticalShortages.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-emerald-400 flex items-center space-x-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Actionable Mitigation Tasks</span>
                    </h5>
                    <ul className="mt-2 space-y-1.5 font-sans text-slate-300 list-inside list-decimal leading-relaxed">
                      {simReport.suggestedEmergencyTasks.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            Select an incident from the registry list to load details.
          </div>
        )}
      </div>

      {/* MODAL: Declare Disaster */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Declare Incident Incident</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Incident Name / Classification</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Coastal Surge Flooding Sector 2" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Disaster Category</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as DisasterType)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Flood">Flood</option>
                    <option value="Cyclone">Cyclone</option>
                    <option value="Earthquake">Earthquake</option>
                    <option value="Wildfire">Wildfire</option>
                    <option value="Landslide">Landslide</option>
                    <option value="Tsunami">Tsunami</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Severity Index</label>
                  <select 
                    value={severity} 
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Critical">Critical Threat</option>
                    <option value="High">High Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="Low">Low Threat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational Coordinates</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      readOnly
                      placeholder="Click pin to select location..." 
                      value={location} 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none cursor-pointer"
                      onClick={() => {
                        setPickerTarget('add');
                        setIsLocPickerOpen(true);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget('add');
                        setIsLocPickerOpen(true);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                      title="Select on Interactive GIS Map"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Affected Regional Population</label>
                  <input 
                    type="number" 
                    required
                    value={affected} 
                    onChange={(e) => setAffected(Number(e.target.value))}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Incident Report narrative</label>
                <textarea 
                  required
                  placeholder="Summarize structural damages, evacuation progress and logistics blocks..."
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 h-24 focus:outline-none"
                />
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
                  Submit Declaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Disaster */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Revise Incident Report</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Incident Name / Title</label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Disaster Category</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as DisasterType)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Flood">Flood</option>
                    <option value="Cyclone">Cyclone</option>
                    <option value="Earthquake">Earthquake</option>
                    <option value="Wildfire">Wildfire</option>
                    <option value="Landslide">Landslide</option>
                    <option value="Tsunami">Tsunami</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Severity Index</label>
                  <select 
                    value={severity} 
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Critical">Critical Threat</option>
                    <option value="High">High Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="Low">Low Threat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational Coordinates</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      readOnly
                      placeholder="Click pin to select location..." 
                      value={location} 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none cursor-pointer"
                      onClick={() => {
                        setPickerTarget('edit');
                        setIsLocPickerOpen(true);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget('edit');
                        setIsLocPickerOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                      title="Select on Interactive GIS Map"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Affected Regional Population</label>
                  <input 
                    type="number" 
                    required
                    value={affected} 
                    onChange={(e) => setAffected(Number(e.target.value))}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Incident Narrative Report</label>
                <textarea 
                  required
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 h-24 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="border border-slate-250 text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm"
                >
                  Save Revision
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
          title={pickerTarget === 'add' ? "Select New Incident Coordinates" : "Revise Incident Coordinates"}
        />
      )}

    </div>
  );
};
