/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CustomMap } from '../components/CustomMap';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Cpu, 
  Activity, 
  Wind, 
  Droplet, 
  Zap, 
  HardDrive, 
  RefreshCw, 
  ShieldAlert, 
  Sliders, 
  FileText, 
  Radio, 
  CheckSquare, 
  Clock,
  ArrowRight,
  TrendingDown,
  Users,
  Truck,
  Home,
  Package,
  Heart,
  Phone,
  ShieldCheck,
  Plus,
  Check,
  Award,
  Trash2,
  MapPin,
  X,
  PlusCircle,
  TrendingUp,
  Map,
  Compass,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { RequestPriority, UserRole, Shelter, Volunteer, Delivery } from '../types';

export const Dashboard: React.FC = () => {
  const { 
    disasters, 
    shelters, 
    resources, 
    requests, 
    volunteers, 
    ngos,
    deliveries,
    activityLogs, 
    logActivity,
    currentUser,
    addResourceRequest,
    updateRequestStatus,
    dispatchDelivery,
    updateDeliveryStatus,
    updateShelter,
    updateVolunteer
  } = useApp();

  // Role simulation override state
  const [selectedRoleView, setSelectedRoleView] = useState<string>('');

  // Set default simulated view based on logged-in user role
  useEffect(() => {
    if (currentUser?.role) {
      // Map Super Admin to Disaster Management Authority view for Dashboard purposes
      if (currentUser.role === 'Super Admin') {
        setSelectedRoleView('Disaster Management Authority');
      } else {
        setSelectedRoleView(currentUser.role);
      }
    } else {
      setSelectedRoleView('Disaster Management Authority');
    }
  }, [currentUser]);

  // Digital Twin Stress Simulator State (for Disaster Authority / Command Center)
  const [stressLevel, setStressLevel] = useState<number>(35); // Percentage of applied weather stress
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Dynamic calculations based on applied Stress Level (representing category storms, flooding)
  const simulatedSubstationHealth = useMemo(() => {
    return Math.max(12, Math.round(98.5 - (stressLevel * 0.85)));
  }, [stressLevel]);

  const simulatedPumpsHealth = useMemo(() => {
    const baseDamage = stressLevel * 0.4;
    const cascadeDamage = simulatedSubstationHealth < 55 ? (55 - simulatedSubstationHealth) * 1.1 : 0;
    return Math.max(8, Math.round(94.2 - baseDamage - cascadeDamage));
  }, [stressLevel, simulatedSubstationHealth]);

  const simulatedTowerHealth = useMemo(() => {
    const baseDamage = stressLevel * 0.35;
    const cascadeDamage = simulatedSubstationHealth < 50 ? (50 - simulatedSubstationHealth) * 0.95 : 0;
    return Math.max(15, Math.round(99.1 - baseDamage - cascadeDamage));
  }, [stressLevel, simulatedSubstationHealth]);

  // Combined failure risk score (Simulating Ensemble Output)
  const combinedRiskPct = useMemo(() => {
    const weightXgb = 0.6;
    const weightLstm = 0.4;
    const xgbRisk = Math.min(100, stressLevel * 1.1 + 10);
    const lstmRisk = Math.min(100, (stressLevel > 70 ? (stressLevel - 70) * 2.5 : 0) + 15);
    return Math.round((xgbRisk * weightXgb) + (lstmRisk * weightLstm));
  }, [stressLevel]);

  // SHAP Feature Contribution Data
  const shapData = useMemo(() => {
    return [
      { name: 'Soil Moisture Level', impact: Math.round(stressLevel * 0.35 + 8), color: '#ef4444' },
      { name: 'Wind Speed', impact: Math.round(stressLevel * 0.28 + 5), color: '#f97316' },
      { name: 'Equipment Age', impact: 24, color: '#eab308' },
      { name: 'Site Elevation', impact: 14, color: '#3b82f6' },
      { name: 'Power Backup Lag', impact: simulatedSubstationHealth < 60 ? 32 : 10, color: '#8b5cf6' }
    ].sort((a, b) => b.impact - a.impact);
  }, [stressLevel, simulatedSubstationHealth]);

  // Simulated sequential LSTM sensor timeline (vibration rates, temperature)
  const sensorTimelineData = [
    { name: 'T-24h', Vibration: 1.2, Temperature: 42, Load: 350 },
    { name: 'T-18h', Vibration: 1.4, Temperature: 45, Load: 380 },
    { name: 'T-12h', Vibration: 1.9, Temperature: 48, Load: 420 },
    { name: 'T-6h', Vibration: 2.5, Temperature: 54, Load: 490 },
    { name: 'T-2h', Vibration: Math.round((1.2 + (stressLevel * 0.05)) * 10) / 10, Temperature: Math.round(42 + (stressLevel * 0.4)), Load: Math.round(350 + (stressLevel * 2.5)) },
  ];

  // Active mitigation checkboxes state
  const [mitigations, setMitigations] = useState({
    isolateBreakers: false,
    engageGenerators: false,
    openFloodgates: false,
    throttleSignal: false
  });

  const handleToggleMitigation = async (key: keyof typeof mitigations, label: string) => {
    const nextVal = !mitigations[key];
    setMitigations(prev => ({ ...prev, [key]: nextVal }));
    
    const actionDesc = nextVal ? 'ENGAGED' : 'DISENGAGED';
    await logActivity(
      'Mitigation Feedback Dispatch',
      `Manual mitigation command '${label}' changed to ${actionDesc} under active stress load of ${stressLevel}%`
    );
  };

  const handleTriggerStressSimulation = async () => {
    setIsSimulating(true);
    await logActivity(
      'Digital Twin Stress Sequence',
      `Executed continuous environmental stress test sequences at load level ${stressLevel}%. Simulating core grid response.`
    );
    setTimeout(() => {
      setIsSimulating(false);
      alert('Physical digital twin stress sequence evaluated successfully! Simulated telemetry reports synced to audit log.');
    }, 1200);
  };

  // ================= NGO OPERATIONAL CONTROLS =================
  const [selectedVolunteerForReq, setSelectedVolunteerForReq] = useState<Record<string, string>>({});
  const activeNGO = useMemo(() => {
    return ngos.find(n => n.email === currentUser?.email) || ngos[0];
  }, [ngos, currentUser]);

  const handleNgoDispatch = async (requestId: string) => {
    const volunteerId = selectedVolunteerForReq[requestId];
    if (!volunteerId) {
      alert('Please select an available field responder to assign to this shipment.');
      return;
    }
    const ngoIdToUse = activeNGO?.id || 'ngo-1';
    try {
      await dispatchDelivery(requestId, ngoIdToUse, volunteerId);
      await logActivity(
        'NGO Resource Dispatch',
        `NGO matched and dispatched volunteer to request ${requestId.substring(0, 8)}`
      );
      alert('Relief shipment successfully dispatched! Dispatch coordinates synced, and responder has been set to Busy.');
      // Clear selection
      setSelectedVolunteerForReq(prev => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    } catch (err) {
      console.error('Dispatch failed:', err);
    }
  };

  // ================= SHELTER OPERATIONS CONTROLS =================
  const [selectedShelterId, setSelectedShelterId] = useState<string>('');
  const activeShelter = useMemo(() => {
    const idToFind = selectedShelterId || shelters[0]?.id || '';
    return shelters.find(s => s.id === idToFind) || shelters[0];
  }, [shelters, selectedShelterId]);

  // Requisition Form State
  const [reqItem, setReqItem] = useState('Water');
  const [reqQty, setReqQty] = useState<number>(150);
  const [reqPriority, setReqPriority] = useState<RequestPriority>('High');
  const [submittingReq, setSubmittingReq] = useState<boolean>(false);

  const handleToggleUtility = async (field: 'electricity' | 'waterAvailability' | 'foodAvailability' | 'medicalFacilities', label: string) => {
    if (!activeShelter) return;
    const updated: Shelter = {
      ...activeShelter,
      [field]: !activeShelter[field]
    };
    try {
      await updateShelter(updated);
      await logActivity(
        'Shelter Vital Infrastructure Toggle',
        `Shelter '${activeShelter.name}' changed operational state of '${label}' to ${updated[field] ? 'NOMINAL' : 'CRITICAL OUTAGE'}`
      );
    } catch (err) {
      console.error('Utility toggle failed:', err);
    }
  };

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShelter) return;
    setSubmittingReq(true);
    try {
      await addResourceRequest(activeShelter.id, [{ item: reqItem, quantity: reqQty }], reqPriority);
      await logActivity(
        'Shelter Requisition Submission',
        `Requisition submitted for ${reqQty} units of ${reqItem} (Priority: ${reqPriority}) by Shelter Manager`
      );
      alert(`Requisition for ${reqQty} units of ${reqItem} logged successfully in central registries.`);
      setReqQty(150);
    } catch (err) {
      console.error('Requisition failed:', err);
    } finally {
      setSubmittingReq(false);
    }
  };

  // ================= VOLUNTEER RESPONDER CONTROLS =================
  const activeVolunteer = useMemo(() => {
    return volunteers.find(v => v.phone === currentUser?.phone) || volunteers[0];
  }, [volunteers, currentUser]);

  const handleToggleAvailability = async (newStatus: 'Available' | 'Busy' | 'Offline') => {
    if (!activeVolunteer) return;
    const updated: Volunteer = {
      ...activeVolunteer,
      availability: newStatus
    };
    try {
      await updateVolunteer(updated);
      await logActivity(
        'Volunteer Operational Status Shift',
        `Volunteer responder '${activeVolunteer.name}' updated dispatch status to ${newStatus}`
      );
    } catch (err) {
      console.error('Availability update failed:', err);
    }
  };

  const handleAdvanceMission = async (delivery: Delivery) => {
    let nextStatus: Delivery['status'] = 'Dispatched';
    let note = '';
    
    if (delivery.status === 'Dispatched') {
      nextStatus = 'In Transit';
      note = 'Cargo verified; field responder is now en-route to safety shelter.';
    } else if (delivery.status === 'In Transit') {
      nextStatus = 'Near Shelter';
      note = 'Responder within immediate proximity of safety perimeter.';
    } else if (delivery.status === 'Near Shelter') {
      nextStatus = 'Delivered';
      note = 'Relief supplies handed off and checked. Delivery mission concluded.';
    }

    try {
      await updateDeliveryStatus(delivery.id, nextStatus, note);
      await logActivity(
        'Relief Transit Transition',
        `Delivery ${delivery.id.substring(0, 8)} advanced to status: ${nextStatus}`
      );
    } catch (err) {
      console.error('Transit update failed:', err);
    }
  };

  const handleSelfClaimRequest = async (reqId: string) => {
    if (!activeVolunteer) return;
    try {
      const defaultNgoId = ngos[0]?.id || 'ngo-1';
      await dispatchDelivery(reqId, defaultNgoId, activeVolunteer.id);
      await logActivity(
        'Volunteer Self-Sourcing Mission',
        `Volunteer responder '${activeVolunteer.name}' claimed and self-assigned pending requisition request ${reqId.substring(0, 8)}`
      );
      alert('Relief shipment self-assigned successfully! Route coordinates active on responder console.');
    } catch (err) {
      console.error('Self claim failed:', err);
    }
  };

  // ================= CITIZEN SOS CONTROLS =================
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenNeed, setCitizenNeed] = useState('Medicine');
  const [citizenDesc, setCitizenDesc] = useState('');
  const [submittingSOS, setSubmittingSOS] = useState(false);

  const handleSubmitSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName || !citizenPhone || !citizenDesc) {
      alert('Please fill out all mandatory fields so dispatch responders can reach you.');
      return;
    }
    setSubmittingSOS(true);
    try {
      // Pick first shelter as rescue coordinate
      const fallbackShelterId = shelters[0]?.id || 'shelter-1';
      await addResourceRequest(fallbackShelterId, [{ item: citizenNeed, quantity: 1 }], 'Critical');
      await logActivity(
        'Citizen SOS Rescue Request',
        `SOS requisition submitted by ${citizenName} (${citizenPhone}): ${citizenDesc} - Category: ${citizenNeed}`
      );
      alert('SOS ALERT BROADCASTED. Your coordinates have been tagged. Safe rescue personnel and closest NGOs have been notified.');
      setCitizenName('');
      setCitizenPhone('');
      setCitizenDesc('');
    } catch (err) {
      console.error('SOS submission failed:', err);
    } finally {
      setSubmittingSOS(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation perspective header switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>Enterprise Command Console</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-mono font-medium px-2 py-0.5 rounded-full">
                  Role-Adaptive Interface
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current Authenticated Account: <strong className="text-slate-700">{currentUser?.name || 'Public Guest'}</strong> ({currentUser?.role || 'Guest'})
              </p>
            </div>
          </div>

          {/* Interactive Toggle Pill Container */}
          <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            {[
              { id: 'Disaster Management Authority', label: 'Authority Command' },
              { id: 'NGO', label: 'NGO Alliance' },
              { id: 'Shelter Manager', label: 'Shelter Manager' },
              { id: 'Volunteer', label: 'Field Responder' },
              { id: 'Public User', label: 'Public Portal' }
            ].map(rolePill => (
              <button
                key={rolePill.id}
                onClick={() => setSelectedRoleView(rolePill.id)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  selectedRoleView === rolePill.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {rolePill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRoleView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* ========================================================================= */}
          {/* PERSPECTIVE: DISASTER MANAGEMENT AUTHORITY & SUPER ADMIN (SYSTEM CENTRAL) */}
          {/* ========================================================================= */}
          {(selectedRoleView === 'Disaster Management Authority' || selectedRoleView === 'Super Admin') && (
            <div className="space-y-6">
              
              {/* Alert banner if threat score is elevated */}
              {combinedRiskPct >= 65 && (
                <div id="risk-alert-banner" className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-rose-600 text-white rounded-lg flex-shrink-0 mt-0.5">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                        CRITICAL THREAT CLASSIFICATION: ENSEMBLE CRITICAL (RISK {combinedRiskPct}%)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Soil saturation limits exceeded near Vijayawada water assets and grid lines. High probability of cascading substructure failure within the next 12.5 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setMitigations({
                          isolateBreakers: true,
                          engageGenerators: true,
                          openFloodgates: true,
                          throttleSignal: true
                        });
                        logActivity('Batch Mitigation Override', 'Initiated full emergency failsafe trigger sequences.');
                        alert('All recommended automated failsafe mitigations have been globally dispatched to active utilities!');
                      }}
                      className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg flex items-center space-x-1 border border-rose-700 cursor-pointer transition-colors"
                    >
                      <span>Automate Mitigation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Central Authority KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                    <AlertTriangle className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Active Catastrophe Incidents</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {disasters.filter(d => d.status === 'Active').length}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Total Evacuees Logged</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {shelters.reduce((acc, s) => acc + (s.occupancy || 0), 0)}
                      <span className="text-xs text-slate-400 font-normal"> / {shelters.reduce((acc, s) => acc + (s.capacity || 0), 0)} beds</span>
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Pending Logistics Requisitions</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {requests.filter(r => r.status === 'Pending').length}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Field Personnel Mobilized</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {volunteers.filter(v => v.availability === 'Busy').length}
                      <span className="text-xs text-slate-400 font-normal"> / {volunteers.length} available</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Grid: Stress Simulator & Live Network Digital Twin Status */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Digital Twin Simulator Controller */}
                <div id="twin-controller-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                        <Sliders className="h-4.5 w-4.5 text-rose-600" />
                        <span>Crisis Simulation & Capacity Estimator</span>
                      </h3>
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded font-mono">
                        PREDICTIVE MODEL
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                      Adjust the simulated crisis level to estimate the potential impact on key community power, water, and telecom structures.
                    </p>

                    <div className="space-y-6 mt-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-700">Simulated Storm & Flood Severity</span>
                          <span className="text-sm font-black text-rose-600 font-mono">{stressLevel}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={stressLevel} 
                          onChange={(e) => setStressLevel(parseInt(e.target.value))} 
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
                          <span>NOMINAL</span>
                          <span>MODERATE</span>
                          <span>CRITICAL (STORM SURGE)</span>
                        </div>
                      </div>

                      {/* Real-time Indicator Cards */}
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg bg-white">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold text-slate-700">Substation Power Level</span>
                          </div>
                          <span className={`font-bold ${simulatedSubstationHealth < 40 ? 'text-rose-600' : simulatedSubstationHealth < 75 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {simulatedSubstationHealth}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg bg-white">
                          <div className="flex items-center space-x-2">
                            <Droplet className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-slate-700">Water Pump Operation Rate</span>
                          </div>
                          <div className="text-right">
                            <span className={`font-bold block ${simulatedPumpsHealth < 40 ? 'text-rose-600' : simulatedPumpsHealth < 75 ? 'text-amber-500' : 'text-emerald-600'}`}>
                              {simulatedPumpsHealth}%
                            </span>
                            {simulatedSubstationHealth < 55 && (
                              <span className="text-[8px] text-rose-500 font-bold block">GRID CASCADE DETECTED</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg bg-white">
                          <div className="flex items-center space-x-2">
                            <Radio className="h-4 w-4 text-rose-500" />
                            <span className="font-semibold text-slate-700">Cell Network Signal Strength</span>
                          </div>
                          <span className={`font-bold ${simulatedTowerHealth < 40 ? 'text-rose-600' : simulatedTowerHealth < 75 ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {simulatedTowerHealth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleTriggerStressSimulation}
                    disabled={isSimulating}
                    className={`w-full mt-5 font-mono text-xs uppercase font-bold py-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      isSimulating 
                        ? 'bg-slate-100 text-slate-400 border-slate-200' 
                        : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-750 shadow-sm'
                    }`}
                  >
                    {isSimulating ? 'Evaluating Cascade Paths...' : 'Run Simulation Check'}
                  </button>
                </div>

                {/* Right Column: AI Predictions & Multi-Model Telemetry Engine */}
                <div id="predictions-engine-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                        <Cpu className="h-4.5 w-4.5 text-rose-600" />
                        <span>Failsafe System Integrity & Forecast</span>
                      </h3>
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded font-mono">
                        INTELLIGENT FORECAST ENGINE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      
                      {/* Ensemble Risk Gauge */}
                      <div className="md:col-span-5 flex flex-col justify-center items-center p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Simulated Infrastructure Exposure</span>
                        <div className="relative my-4 flex items-center justify-center">
                          {/* Gauge Ring */}
                          <svg className="w-28 h-28 transform -rotate-95">
                            <circle cx="56" cy="56" r="48" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                            <circle 
                              cx="56" 
                              cy="56" 
                              r="48" 
                              stroke={combinedRiskPct > 70 ? '#ef4444' : combinedRiskPct > 40 ? '#f97316' : '#10b981'} 
                              strokeWidth="10" 
                              fill="none" 
                              strokeDasharray="301" 
                              strokeDashoffset={301 - (301 * (combinedRiskPct / 100))} 
                              className="transition-all duration-300"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-black text-slate-950 font-mono tracking-tighter leading-none">{combinedRiskPct}%</span>
                            <span className="text-[8px] font-bold uppercase text-slate-400 mt-1">EXPOSURE SCORE</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-full ${
                          combinedRiskPct > 70 ? 'bg-rose-100 text-rose-700' :
                          combinedRiskPct > 40 ? 'bg-orange-100 text-orange-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {combinedRiskPct > 70 ? 'CRITICAL RISK / FAILURE PROBABLE' : combinedRiskPct > 40 ? 'ELEVATED / MONITORING' : 'STABLE / MINIMAL RISK'}
                        </span>
                      </div>

                      {/* Explainable AI contribution chart */}
                      <div className="md:col-span-7 space-y-3">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                            <span>Key Contributors to Exposure</span>
                          </h4>
                          <p className="text-[9px] text-slate-400 leading-normal mt-0.5">
                            Highlighting active hazards driving the current simulation forecasts.
                          </p>
                        </div>

                        <div className="space-y-2 font-mono text-[10px]">
                          {shapData.map((item, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-slate-600">
                                <span className="font-semibold">{item.name}</span>
                                <span className="font-bold">+{item.impact}% Hazard Impact</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min(100, item.impact * 1.5)}%`, backgroundColor: item.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>INTELLIGENT SCORING ALGORITHMS ACTIVE</span>
                    <span className="flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>LIVE SCORING</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Map Room Visualization */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                      <span>Emergency Resources & Infrastructure Map</span>
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-sans">Geospatially rendering shelters, relief supplies, active personnel, and vital community structures.</p>
                  </div>
                  <button 
                    onClick={() => alert('Only Authorized Officials may register custom assets on the active map.')}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-950 border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 rounded-lg px-3 py-1.5 flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <span>Register Asset Coordinates</span>
                  </button>
                </div>
                <CustomMap />
              </div>

              {/* Bottom Grid: Load charts, Mitigation Actions & Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Real-time utility loads */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">Infrastructure Load & Utilization Trends</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Simulated real-time utility loads and grid junction stress over a rolling 24-hour sequence.</p>
                  </div>
                  
                  <div className="h-64 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sensorTimelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <RechartsTooltip />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 10, marginTop: 10 }} />
                        <Area type="monotone" name="Simulated Utility Load (kW)" dataKey="Vibration" stroke="#ef4444" fillOpacity={1} fill="url(#colorVib)" strokeWidth={1.5} />
                        <Area type="monotone" name="Infrastructure Temperature (°C)" dataKey="Temperature" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Closed-loop Mitigation Recommendations panel */}
                <div id="mitigation-recommendations-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">Failsafe Mitigation Actions</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Actionable items recommended by the system to safeguard communities and secure infrastructure.</p>

                    <div className="space-y-3 mt-4 text-xs">
                      
                      <label className="flex items-start space-x-3 p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={mitigations.isolateBreakers}
                          onChange={() => handleToggleMitigation('isolateBreakers', 'Disconnect Vulnerable Electrical Lines')}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Disconnect Vulnerable Electrical Lines</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Turn off unstable electrical junctions in high-risk areas automatically.</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={mitigations.engageGenerators}
                          onChange={() => handleToggleMitigation('engageGenerators', 'Engage Backup Diesel Generators')}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Engage Backup Diesel Generators</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Secure electricity for critical water treatment systems and rescue devices.</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={mitigations.openFloodgates}
                          onChange={() => handleToggleMitigation('openFloodgates', 'Open Relief Flood Valves')}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">Open Relief Flood Valves</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Reduces water pressure near flood-prone coastal shelters and roads.</span>
                        </div>
                      </label>

                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>COMMUNITY FAILSAFES ACTIVE</span>
                    <span>SECURED RESPONSE</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PERSPECTIVE: NGO RELIEF COMMAND CENTER                                   */}
          {/* ========================================================================= */}
          {selectedRoleView === 'NGO' && (
            <div className="space-y-6">
              
              {/* NGO Quick KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Active In-Transit Shipments</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {deliveries.filter(d => d.status !== 'Delivered').length}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Unassigned Pending Requisitions</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {requests.filter(r => r.status === 'Pending').length}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">My Organization Dispatch SLA</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {activeNGO?.performanceScore || 96}%
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Registered Field Responders</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {volunteers.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Pending Requisitions Matchmaker */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                        <Package className="h-4.5 w-4.5 text-rose-600" />
                        <span>Requisitions Dispatch Matchmaker</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Assign available field responders to pending shelter requirements instantly.</p>
                    </div>
                    <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded font-mono">
                      DISPATCH QUEUE
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {requests.filter(r => r.status === 'Pending').length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400 font-mono">
                        No pending requisitions require dispatch matchmaking at this time.
                      </div>
                    ) : (
                      requests.filter(r => r.status === 'Pending').map(req => {
                        const availableResponders = volunteers.filter(v => v.availability === 'Available');
                        
                        return (
                          <div key={req.id} className="p-3.5 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 bg-slate-200 rounded text-slate-700">
                                  REQ-{req.id.substring(0, 5).toUpperCase()}
                                </span>
                                <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded ${
                                  req.priority === 'Critical' ? 'bg-rose-100 text-rose-700 animate-pulse' :
                                  req.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {req.priority}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">{req.date}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-900 block">{req.shelterName}</span>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-1">
                                <span>Demanded cargo:</span>
                                <strong className="text-slate-700">
                                  {req.items.map(item => `${item.quantity} ${item.item}`).join(', ')}
                                </strong>
                              </div>
                            </div>

                            {/* Matchmaker Assign Control */}
                            <div className="flex items-center space-x-2 w-full md:w-auto">
                              <select 
                                value={selectedVolunteerForReq[req.id] || ''}
                                onChange={(e) => setSelectedVolunteerForReq(prev => ({ ...prev, [req.id]: e.target.value }))}
                                className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 flex-1 md:w-44 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 cursor-pointer"
                              >
                                <option value="">Select Field Responder...</option>
                                {availableResponders.map(v => (
                                  <option key={v.id} value={v.id}>
                                    {v.name} ({v.vehicle})
                                  </option>
                                ))}
                                {availableResponders.length === 0 && (
                                  <option disabled>No Responders Available</option>
                                )}
                              </select>

                              <button
                                onClick={() => handleNgoDispatch(req.id)}
                                className="text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg border border-rose-700 cursor-pointer transition-all flex items-center space-x-1 self-stretch"
                              >
                                <Truck className="h-3.5 w-3.5" />
                                <span>Dispatch</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Side: Active Relief Shipments Tracker Table */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                          <Activity className="h-4.5 w-4.5 text-rose-600" />
                          <span>Active Delivery Tracking Registry</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Real-time status updates of shipments currently en-route in the system.</p>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto">
                      {deliveries.filter(d => d.status !== 'Delivered').length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400 font-mono">
                          No active deliveries en-route at this time.
                        </div>
                      ) : (
                        deliveries.filter(d => d.status !== 'Delivered').map(del => {
                          const statusPercentage = 
                            del.status === 'Dispatched' ? 25 :
                            del.status === 'In Transit' ? 50 :
                            del.status === 'Near Shelter' ? 75 : 100;

                          return (
                            <div key={del.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/20">
                              <div className="flex justify-between items-start mb-1.5">
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-slate-400">TRACK-{del.id.substring(0, 5).toUpperCase()}</span>
                                  <h4 className="text-xs font-bold text-slate-800">{del.shelterName}</h4>
                                </div>
                                <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                                  del.status === 'Dispatched' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                                  del.status === 'In Transit' ? 'bg-amber-50 text-amber-700 border border-amber-150 animate-pulse' :
                                  'bg-emerald-50 text-emerald-700 border border-emerald-150'
                                }`}>
                                  {del.status}
                                </span>
                              </div>

                              <div className="space-y-1 font-mono text-[9px] text-slate-400 mb-2">
                                <div className="flex justify-between">
                                  <span>Assigned Driver:</span>
                                  <span className="font-bold text-slate-600">{del.volunteerName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>ETA:</span>
                                  <span className="font-bold text-indigo-600">{del.estimatedArrival}</span>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="space-y-1">
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-rose-600 rounded-full transition-all duration-300" 
                                    style={{ width: `${statusPercentage}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                                  <span>DISPATCHED</span>
                                  <span>IN TRANSIT</span>
                                  <span>NEAR SITE</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>NGO ALLIANCE DISPATCH MODULES ACTIVE</span>
                    <span>AUTOMATIC TRACKING</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PERSPECTIVE: SHELTER LOGISTICS CONSOLE (SHELTER MANAGER)                   */}
          {/* ========================================================================= */}
          {selectedRoleView === 'Shelter Manager' && (
            <div className="space-y-6">
              
              {/* Shelter Selector Option Dropdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-rose-100 text-rose-700 rounded-md">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Active Shelter Focus</span>
                    <p className="text-[9px] text-slate-400">Select which evacuation facility registry to analyze and log requisitions for.</p>
                  </div>
                </div>
                <select
                  value={selectedShelterId || (shelters[0]?.id || '')}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                >
                  {shelters.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {activeShelter ? (
                <>
                  {/* KPI stats specific to active shelter */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Current Bed Load</span>
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                      <span className="text-2xl font-bold text-slate-900 font-mono block">
                        {activeShelter.occupancy} <span className="text-xs text-slate-400 font-normal">/ {activeShelter.capacity} Beds occupied</span>
                      </span>
                      {/* Visual Progress bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <div 
                          className={`h-full rounded-full ${
                            (activeShelter.occupancy / activeShelter.capacity) > 0.9 ? 'bg-amber-500' : 'bg-rose-600'
                          }`}
                          style={{ width: `${Math.min(100, (activeShelter.occupancy / activeShelter.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                      <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Beds Remaining</span>
                        <span className="text-2xl font-bold text-slate-900 font-mono">
                          {activeShelter.availableBeds}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                      <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                        <RefreshCw className="h-5 w-5 animate-spin-slow" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Pending Logistics Inflow</span>
                        <span className="text-2xl font-bold text-slate-900 font-mono">
                          {requests.filter(r => r.shelterId === activeShelter.id && r.status !== 'Completed' && r.status !== 'Delivered').length}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Facility Operations Status</span>
                        <span className={`text-sm font-bold uppercase block mt-1 ${
                          activeShelter.status === 'Active' ? 'text-emerald-600' : 
                          activeShelter.status === 'Full' ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                          {activeShelter.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Facility Lifeline Support Systems utilities toggle */}
                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                          <Cpu className="h-4.5 w-4.5 text-rose-600" />
                          <span>Facility Life-Support Utilities</span>
                        </h3>
                        <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded font-mono">
                          SHELTER STATUS
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                        Toggle the operational availability of immediate utilities. Changes persist to central registers instantly to guide routing logistics.
                      </p>

                      <div className="space-y-3 text-xs">
                        
                        <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                          <div className="flex items-center space-x-2.5">
                            <Zap className={`h-4.5 w-4.5 ${activeShelter.electricity ? 'text-amber-500' : 'text-slate-400'}`} />
                            <div>
                              <span className="font-bold text-slate-800 block">Emergency Power Grid</span>
                              <span className="text-[8px] text-slate-400 block font-mono">
                                STATUS: {activeShelter.electricity ? 'NOMINAL / RUNNING' : 'CRITICAL OUTAGE'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleUtility('electricity', 'Emergency Power Grid')}
                            className={`px-3 py-1 rounded text-[10px] font-bold font-mono transition-colors border cursor-pointer ${
                              activeShelter.electricity ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {activeShelter.electricity ? 'Nominal' : 'Outage'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                          <div className="flex items-center space-x-2.5">
                            <Droplet className={`h-4.5 w-4.5 ${activeShelter.waterAvailability ? 'text-blue-500' : 'text-slate-400'}`} />
                            <div>
                              <span className="font-bold text-slate-800 block">Drinking Water Supply</span>
                              <span className="text-[8px] text-slate-400 block font-mono">
                                STATUS: {activeShelter.waterAvailability ? 'OPERATIONAL' : 'OUTAGE'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleUtility('waterAvailability', 'Drinking Water Supply')}
                            className={`px-3 py-1 rounded text-[10px] font-bold font-mono transition-colors border cursor-pointer ${
                              activeShelter.waterAvailability ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {activeShelter.waterAvailability ? 'Nominal' : 'Outage'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                          <div className="flex items-center space-x-2.5">
                            <Heart className={`h-4.5 w-4.5 ${activeShelter.foodAvailability ? 'text-rose-500' : 'text-slate-400'}`} />
                            <div>
                              <span className="font-bold text-slate-800 block">Relief Food Provisions</span>
                              <span className="text-[8px] text-slate-400 block font-mono">
                                STATUS: {activeShelter.foodAvailability ? 'ADEQUATE' : 'DEPLETED'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleUtility('foodAvailability', 'Relief Food Provisions')}
                            className={`px-3 py-1 rounded text-[10px] font-bold font-mono transition-colors border cursor-pointer ${
                              activeShelter.foodAvailability ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {activeShelter.foodAvailability ? 'Nominal' : 'Outage'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                          <div className="flex items-center space-x-2.5">
                            <ShieldCheck className={`h-4.5 w-4.5 ${activeShelter.medicalFacilities ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <div>
                              <span className="font-bold text-slate-800 block">First-Aid Medical Ward</span>
                              <span className="text-[8px] text-slate-400 block font-mono">
                                STATUS: {activeShelter.medicalFacilities ? 'STAFFED' : 'UNDERSTAFFED'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleUtility('medicalFacilities', 'First-Aid Medical Ward')}
                            className={`px-3 py-1 rounded text-[10px] font-bold font-mono transition-colors border cursor-pointer ${
                              activeShelter.medicalFacilities ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {activeShelter.medicalFacilities ? 'Nominal' : 'Outage'}
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Middle: Request Supplies Requisition Form */}
                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                          <PlusCircle className="h-4.5 w-4.5 text-rose-600" />
                          <span>Emergency Requisition Submission</span>
                        </h3>
                        <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded font-mono">
                          LOG REQUISITION
                        </span>
                      </div>

                      <form onSubmit={handleAddRequest} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Logistics Cargo Category</label>
                          <select 
                            value={reqItem}
                            onChange={(e) => setReqItem(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 cursor-pointer"
                          >
                            {['Water', 'Food', 'Blankets', 'Medicine', 'Baby Food', 'Fuel', 'Medical Kits', 'Clothes'].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Required Capacity Unit Stock</label>
                          <input 
                            type="number"
                            min="10"
                            max="2000"
                            value={reqQty}
                            onChange={(e) => setReqQty(parseInt(e.target.value) || 0)}
                            className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Disaster Priority Status</label>
                          <div className="grid grid-cols-4 gap-1">
                            {(['Critical', 'High', 'Medium', 'Low'] as RequestPriority[]).map(p => (
                              <button
                                type="button"
                                key={p}
                                onClick={() => setReqPriority(p)}
                                className={`py-1 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                                  reqPriority === p 
                                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm' 
                                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={submittingReq}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs uppercase font-bold py-2 rounded-lg transition-colors border border-rose-750 shadow-sm cursor-pointer"
                        >
                          {submittingReq ? 'Filing Requisition...' : 'Submit Emergency Requisition'}
                        </button>
                      </form>
                    </div>

                    {/* Right: Shelter Requisitions Status tracker */}
                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                          <Clock className="h-4.5 w-4.5 text-rose-600" />
                          <span>Requisitions Inflow Tracking</span>
                        </h3>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {requests.filter(r => r.shelterId === activeShelter.id).length === 0 ? (
                          <div className="py-12 text-center text-xs text-slate-400 font-mono">
                            No logistics requisitions are logged for this shelter.
                          </div>
                        ) : (
                          requests.filter(r => r.shelterId === activeShelter.id).map(req => (
                            <div key={req.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/40 text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-800">
                                  {req.items.map(item => `${item.quantity} ${item.item}`).join(', ')}
                                </span>
                                <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded ${
                                  req.status === 'Completed' || req.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                                  req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                                  'bg-blue-50 text-blue-700 border border-blue-150 animate-pulse'
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                              <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
                                <span>Priority: <strong className="text-slate-600">{req.priority}</strong></span>
                                <span>{req.date}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                  No registered evacuation shelters found to evaluate. Add shelters in the Shelter Management screen.
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* PERSPECTIVE: VOLUNTEER MOBILE RESPONDER CONSOLE                          */}
          {/* ========================================================================= */}
          {selectedRoleView === 'Volunteer' && (
            <div className="space-y-6">
              
              {/* Volunteer Details KPI Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Field Availability Status</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      activeVolunteer?.availability === 'Available' ? 'bg-emerald-500 animate-pulse' :
                      activeVolunteer?.availability === 'Busy' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                  </div>
                  
                  {/* Status pills selector */}
                  <div className="grid grid-cols-3 gap-1 mt-1 text-[9px] font-mono">
                    {(['Available', 'Busy', 'Offline'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => handleToggleAvailability(st)}
                        className={`py-1 rounded font-bold transition-colors border cursor-pointer ${
                          activeVolunteer?.availability === st 
                            ? 'bg-rose-600 text-white border-rose-700 shadow-sm' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                    <CheckSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">My Missions Concluded</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {activeVolunteer?.completedTasks || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Dispatched Transport Vehicle</span>
                    <span className="text-xs font-bold text-slate-800 block mt-1">
                      {activeVolunteer?.vehicle || 'Disaster Response Off-Road SUV'}
                    </span>
                    <span className="text-[8px] text-slate-400 font-mono uppercase block mt-0.5">
                      PLATE: {activeVolunteer?.vehicleNo || 'AP-16-TX-9092'}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Dispatcher Safety Rating</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      ⭐ {activeVolunteer?.rating || '4.9'}
                      <span className="text-[9px] text-slate-400 font-normal"> / 5.0</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Assigned Active Mission Stepper */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                        <Compass className="h-4.5 w-4.5 text-rose-600" />
                        <span>Active Dispatch Mission Directive</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Review cargo manifest, address navigation details, and update dispatch milestones.</p>
                    </div>
                  </div>

                  {activeVolunteer ? (
                    (() => {
                      const currentDelivery = deliveries.find(
                        d => d.volunteerId === activeVolunteer.id && d.status !== 'Delivered'
                      );

                      if (!currentDelivery) {
                        return (
                          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                            <Truck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <h4 className="text-xs font-bold text-slate-700">Operational Standby Mode</h4>
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                              You currently have no active assigned delivery. Change status to **Available** and check the available requisition queue to claim a relief dispatch mission.
                            </p>
                          </div>
                        );
                      }

                      // We have a delivery
                      const relativeRequest = requests.find(r => r.id === currentDelivery.requestId);

                      return (
                        <div className="space-y-5">
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                              <div>
                                <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase">
                                  ACTIVE ASSIGNMENT: EN-ROUTE
                                </span>
                                <h4 className="text-sm font-bold text-slate-950 mt-1">{currentDelivery.shelterName}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">ESTIMATED TRANSIT TIME: {currentDelivery.estimatedArrival}</span>
                              </div>
                              <button
                                onClick={() => handleAdvanceMission(currentDelivery)}
                                className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg border border-rose-750 shadow-sm cursor-pointer transition-colors"
                              >
                                {currentDelivery.status === 'Dispatched' ? 'Begin Cargo Transit' :
                                 currentDelivery.status === 'In Transit' ? 'Mark Near Shelter' :
                                 'Confirm Unloaded & Complete'}
                              </button>
                            </div>

                            <div className="mt-4 border-t border-slate-200 pt-3 text-[11px] text-slate-600 space-y-1.5 font-mono">
                              <div className="flex justify-between">
                                <span>Relief Cargo Manifest:</span>
                                <strong className="text-slate-800">
                                  {relativeRequest?.items.map(it => `${it.quantity} ${it.item}`).join(', ') || 'General Relief Supplies'}
                                </strong>
                              </div>
                              <div className="flex justify-between">
                                <span>Dispatch SLA SLA:</span>
                                <span className="font-bold text-amber-600 uppercase">Critical High Priority Delivery</span>
                              </div>
                            </div>
                          </div>

                          {/* Stepper visual tracking */}
                          <div className="relative flex justify-between items-center px-4">
                            <div className="absolute left-4 right-4 h-0.5 bg-slate-100 top-4 z-0" />
                            {[
                              { label: 'Dispatched', desc: 'Sourced from Hub' },
                              { label: 'In Transit', desc: 'On Highway Route' },
                              { label: 'Near Shelter', desc: 'Arrived Proximity' },
                              { label: 'Delivered', desc: 'Confirmed Receipt' }
                            ].map((step, idx) => {
                              const steps = ['Dispatched', 'In Transit', 'Near Shelter', 'Delivered'];
                              const currentIdx = steps.indexOf(currentDelivery.status);
                              const isActive = idx <= currentIdx;
                              const isCurrent = idx === currentIdx;

                              return (
                                <div key={idx} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                                    isActive 
                                      ? 'bg-rose-600 text-white border-rose-700' 
                                      : 'bg-white text-slate-400 border-slate-200'
                                  } ${isCurrent ? 'ring-4 ring-rose-50 animate-pulse' : ''}`}>
                                    {isActive && idx < currentIdx ? <Check className="h-4 w-4" /> : idx + 1}
                                  </div>
                                  <span className={`text-[10px] font-bold block mt-2 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {step.label}
                                  </span>
                                  <span className="text-[8px] text-slate-400 block max-w-[80px] text-center mt-0.5 font-mono leading-none">
                                    {step.desc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No active responder records found. Register volunteers in the Volunteer Management panel first.
                    </div>
                  )}
                </div>

                {/* Right: Unassigned Delivery Missions Queue */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                          <Package className="h-4.5 w-4.5 text-rose-600" />
                          <span>Missions Available in Your District</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Claim unassigned requisitions and begin transporting cargo immediately.</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[360px] overflow-y-auto">
                      {requests.filter(r => r.status === 'Pending').length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400 font-mono">
                          No pending delivery missions require sourcing right now.
                        </div>
                      ) : (
                        requests.filter(r => r.status === 'Pending').map(req => (
                          <div key={req.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/20 flex items-center justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-800">{req.shelterName}</h4>
                              <div className="text-[10px] text-slate-500 font-mono">
                                Cargo: <strong>{req.items.map(it => `${it.quantity} ${it.item}`).join(', ')}</strong>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSelfClaimRequest(req.id)}
                              className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg border border-rose-750 shadow-sm cursor-pointer transition-colors"
                            >
                              Claim Task
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>VOLUNTEER COMMUNICATIONS ACTIVE</span>
                    <span>SECURE CHANNELS</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PERSPECTIVE: CITIZEN / PUBLIC SAFETY PORTAL                              */}
          {/* ========================================================================= */}
          {selectedRoleView === 'Public User' && (
            <div className="space-y-6">
              
              {/* Emergency Safety Alert Banner */}
              <div className="p-4 bg-rose-600 border border-rose-700 text-white rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-white/10 text-white rounded-xl flex-shrink-0">
                    <ShieldAlert className="h-5.5 w-5.5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider">
                      SEVERE FLOOD WARNING & EVACUATION PROMPTS
                    </h3>
                    <p className="text-xs text-rose-100 mt-0.5 leading-relaxed max-w-3xl">
                      Heavy localized precipitation of up to 240mm has triggered flood alerts near low-lying water assets and reservoirs. Evacuation registries are active. Evacuate safely to nearest open shelters.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 w-full md:w-auto">
                  <a
                    href="tel:108"
                    className="flex-1 text-center text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    Call Helpline (108)
                  </a>
                </div>
              </div>

              {/* Public Safety KPI Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Active Evacuation Safe Havens</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {shelters.filter(s => s.status !== 'Inactive').length}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Vacant Safety Beds Remaining</span>
                    <span className="text-2xl font-bold text-emerald-600 font-mono">
                      {shelters.reduce((acc, s) => acc + (s.availableBeds || 0), 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Helpline Coordination Control Room</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1 font-mono">
                      0866-2474700
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center space-x-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">Active Relief NGOs Sourced</span>
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      {ngos.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Citizen Safe Shelters Finder */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                        <MapPin className="h-4.5 w-4.5 text-rose-600" />
                        <span>Active Safe Havens Directory</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Explore open storm and flood safe shelters with verified utility indicators.</p>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded font-mono">
                      SHELTER DIRECTORY
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                    {shelters.filter(s => s.status !== 'Inactive').map(sh => (
                      <div key={sh.id} className="p-4 border border-slate-150 rounded-xl bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-xs font-bold text-slate-950">{sh.name}</h4>
                            <span className={`text-[8px] font-bold font-mono px-1.5 py-0.2 rounded uppercase ${
                              sh.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            }`}>
                              {sh.status === 'Active' ? 'Available Beds' : 'At Capacity'}
                            </span>
                          </div>
                          
                          <div className="text-[11px] text-slate-500 font-mono">
                            Location: <strong className="text-slate-700">{sh.location}</strong>
                          </div>

                          {/* Utility Amenities icons with tooltip styled labels */}
                          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] text-slate-400">
                            <span className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border ${
                              sh.waterAvailability ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              <Droplet className="h-3 w-3" />
                              <span>Water</span>
                            </span>
                            <span className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border ${
                              sh.electricity ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              <Zap className="h-3 w-3" />
                              <span>Power</span>
                            </span>
                            <span className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border ${
                              sh.foodAvailability ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              <Heart className="h-3 w-3" />
                              <span>Food</span>
                            </span>
                            <span className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border ${
                              sh.medicalFacilities ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              <ShieldCheck className="h-3 w-3" />
                              <span>Medical</span>
                            </span>
                          </div>
                        </div>

                        <div className="text-right self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-mono">VACANT CAPACITY</span>
                            <span className="text-lg font-black text-slate-900 font-mono block leading-none">{sh.availableBeds} beds</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Citizen Urgent SOS Request Form */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                        <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
                        <span>Public Immediate Assistance SOS Desk</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">File an emergency distress request for safe rescue, evacuation support, or water aid.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitSOS} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Your Full Name (SOS Contact)</label>
                      <input 
                        type="text"
                        required
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        placeholder="e.g., Eswar Prasad"
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Rescue Mobile Contact Number</label>
                      <input 
                        type="tel"
                        required
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        placeholder="e.g., +91 94401 XXXXX"
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Type of Urgent Aid Required</label>
                      <select 
                        value={citizenNeed}
                        onChange={(e) => setCitizenNeed(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 cursor-pointer"
                      >
                        <option value="Water">Urgent Drinking Water Shortage</option>
                        <option value="Food">Relief Provisions & Baby Food</option>
                        <option value="Medicine">Critical First-Aid & Medication</option>
                        <option value="Blankets">Blankets & Immediate Evac Cover</option>
                        <option value="Fuel">Fuel for Inundated Generators</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Details of Distress Situation (Specify Coordinates / Landmark)</label>
                      <textarea 
                        required
                        rows={3}
                        value={citizenDesc}
                        onChange={(e) => setCitizenDesc(e.target.value)}
                        placeholder="Please specify address, count of trapped evacuees, and visual landmarks..."
                        className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-700 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingSOS}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs uppercase font-black py-3 rounded-lg transition-colors border border-rose-750 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      <span>{submittingSOS ? 'Broadcasting Rescue Code...' : 'Broadcast SOS Rescue Alert'}</span>
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Compliance & Operations Audit Trail Tracker (Visible to all, showing real history) */}
      <div id="compliance-audit-panel" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">System Activity & Operations Log</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Audit trail logging simulation triggers, user adjustments, and critical dispatch events.</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {activityLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No compiled audit records found in the datastore.
            </div>
          ) : (
            activityLogs.slice(0, 6).map(log => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-start space-x-2.5">
                  <div className="p-1 bg-slate-50 rounded text-slate-600 mt-0.5 flex-shrink-0 border border-slate-100">
                    <Clock className="h-3 w-3 text-rose-500" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900">{log.action}</span>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{log.details}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-[10px] self-end sm:self-auto font-mono text-slate-400">
                  <span className="font-bold text-slate-600">{log.userName} ({log.role})</span>
                  <span>•</span>
                  <span>{log.timestamp.substring(11, 19) || log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
