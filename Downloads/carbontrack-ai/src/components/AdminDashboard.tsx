import React, { useState } from 'react';
import { 
  Sliders, Users, ClipboardList, Database, Sparkles, 
  Trash2, Plus, Edit, Check, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { EmissionFactor } from '../types';

interface AdminDashboardProps {
  emissionFactors: EmissionFactor[];
  onAddFactor: (factor: Omit<EmissionFactor, 'id'>) => Promise<void>;
  onDeleteFactor: (type: string) => Promise<void>;
}

export default function AdminDashboard({ emissionFactors, onAddFactor, onDeleteFactor }: AdminDashboardProps) {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'factors' | 'users' | 'logs'>('factors');
  
  const [showFactorForm, setShowFactorForm] = useState(false);
  const [newCat, setNewCat] = useState<'transport' | 'electricity' | 'food' | 'shopping' | 'travel' | 'waste'>('transport');
  const [newType, setNewType] = useState('');
  const [newFactor, setNewFactor] = useState<number>(0.2);
  const [newUnit, setNewUnit] = useState('km');
  const [newDesc, setNewDesc] = useState('');

  // Mock organizations registry
  const organizations = [
    { id: 'org-1', name: 'Global Green Logistics Inc.', domain: 'greenlogistics.com', departmentCount: 8, members: 210, co2Saved: '42.5k kg' },
    { id: 'org-2', name: 'EcoTech Innovations Corp.', domain: 'ecotech.io', departmentCount: 5, members: 112, co2Saved: '24.1k kg' },
    { id: 'org-3', name: 'Planetary Health Hospital', domain: 'phh.org', departmentCount: 12, members: 480, co2Saved: '89.0k kg' }
  ];

  // Mock server logs audit trail
  const systemLogs = [
    { timestamp: '2026-07-18T08:31:02-07:00', type: 'INFO', module: 'AUTH', text: 'Secure sign-in successful for coordinator@disasterresponse.org' },
    { timestamp: '2026-07-18T08:30:45-07:00', type: 'INFO', module: 'ROUTING', text: 'Resource shipment route optimized for Metro-Center Shelter Alpha' },
    { timestamp: '2026-07-18T08:29:12-07:00', type: 'INFO', module: 'REGISTRY', text: 'Committed localized resource update: 1,500L bottled water for Sector 4' },
    { timestamp: '2026-07-18T08:24:00-07:00', type: 'WARN', module: 'ALERTS', text: 'Alert broadcast dispatched: localized flash flood warnings in effect' },
    { timestamp: '2026-07-18T08:15:20-07:00', type: 'INFO', module: 'DATABASE', text: 'Database rules synced. Active connection pool: 12 nodes online' }
  ];

  const handleCreateFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType || newFactor <= 0 || !newUnit) return;

    const added = {
      category: newCat,
      type: newType,
      factor: newFactor,
      unit: newUnit,
      description: newDesc || "Custom administrator factor update"
    };

    await onAddFactor(added);

    // Reset Form
    setNewType('');
    setNewFactor(0.2);
    setNewUnit('km');
    setNewDesc('');
    setShowFactorForm(false);
  };

  return (
    <div id="admin-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* LEFT COLUMN: Sidebar controllers (3 Columns) */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-widest block mb-4">ADMIN MANAGEMENT</div>
          
          <button
            onClick={() => setActiveAdminSubTab('factors')}
            className={`w-full p-3 text-xs font-bold rounded-2xl flex items-center space-x-2.5 transition-colors ${
              activeAdminSubTab === 'factors' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100' 
                : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Emission Factors Config</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('users')}
            className={`w-full p-3 text-xs font-bold rounded-2xl flex items-center space-x-2.5 transition-colors ${
              activeAdminSubTab === 'users' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100' 
                : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Organizations & Tenants</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('logs')}
            className={`w-full p-3 text-xs font-bold rounded-2xl flex items-center space-x-2.5 transition-colors ${
              activeAdminSubTab === 'logs' 
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100' 
                : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>System Telemetry Logs</span>
          </button>
        </div>

        <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 flex items-start space-x-2.5 text-xs text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">SOC-2 Authority Certified</div>
            <p className="text-[10px] text-emerald-700 mt-0.5">Admin changes immediately write to active Firestore nodes and refresh connected user dashboards in real-time.</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Canvas Workspace (9 Columns) */}
      <div className="lg:col-span-9 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[480px]">
        
        {/* Tab Canvas: FACTORS CONFIG */}
        {activeAdminSubTab === 'factors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Customizable Carbon Coefficients</h3>
                <p className="text-xs text-gray-400">Modify scientific emission factor coefficients (kg CO₂e per unit)</p>
              </div>
              <button
                onClick={() => setShowFactorForm(!showFactorForm)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Factor</span>
              </button>
            </div>

            {/* Create factor form overlay */}
            {showFactorForm && (
              <form onSubmit={handleCreateFactor} className="bg-slate-50 p-5 rounded-2xl border border-gray-150 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <div className="md:col-span-2 text-xs font-bold text-gray-800 border-b border-gray-150 pb-2">Add New Environmental Telemetry Coefficient</div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sector Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white outline-none"
                  >
                    <option value="transport">Travel</option>
                    <option value="electricity">Power</option>
                    <option value="food">Diet</option>
                    <option value="shopping">Goods</option>
                    <option value="travel">Flights</option>
                    <option value="waste">Refuse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coefficient Type Name</label>
                  <input
                    type="text"
                    required
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    placeholder="e.g. Biodiesel Van, Charcoal Grill"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Factor (kg CO₂e per unit)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newFactor}
                    onChange={(e) => setNewFactor(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g. km, kWh, kg, meals"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coefficient Context / Source</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g. Defra 2026 Environmental Factors Repository"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white outline-none"
                  />
                </div>

                <div className="md:col-span-2 flex space-x-2 justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                  >
                    Save Coefficient
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFactorForm(false)}
                    className="px-4 py-2 border border-gray-200 text-xs rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emissionFactors.map((fact, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-gray-100 flex justify-between items-start group">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full mb-2 inline-block capitalize">{fact.category}</span>
                    <h4 className="text-xs font-bold text-gray-900">{fact.type}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">{fact.description}</p>
                    <span className="text-[10px] font-mono font-bold text-gray-500 mt-2 block">CO₂ factor: {fact.factor} kg / {fact.unit}</span>
                  </div>
                  <button
                    onClick={() => onDeleteFactor(fact.type)}
                    className="text-gray-350 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Canvas: USERS & ORGANIZATIONS */}
        {activeAdminSubTab === 'users' && (
          <div className="space-y-6">
            <div className="border-b border-gray-50 pb-4">
              <h3 className="text-base font-bold text-gray-900">Tenants & Organization Registry</h3>
              <p className="text-xs text-gray-400">Review corporate workspaces, employee counts, and aggregate savings statistics</p>
            </div>

            <div className="space-y-4">
              {organizations.map((org) => (
                <div key={org.id} className="p-4 bg-slate-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-950 flex items-center">
                      <Database className="w-4 h-4 text-emerald-600 mr-2" />
                      {org.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Security Domain: *.{org.domain} • ID: {org.id}</span>
                  </div>

                  <div className="flex gap-6 text-center text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase">DEPARTMENTS</span>
                      <span className="font-bold text-gray-800">{org.departmentCount} units</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase">EMPLOYEES</span>
                      <span className="font-bold text-gray-800">{org.members} users</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase">CO₂ PREVENTED</span>
                      <span className="font-bold text-emerald-600">{org.co2Saved}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Canvas: SYSTEM LOGS */}
        {activeAdminSubTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Telemetry Server Audit Trail</h3>
                <p className="text-xs text-gray-400">Verifiable logging checkpoint records from Express and Firebase</p>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-800 rounded-full text-[10px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                <span>DEBUG MODE ENGAGED</span>
              </div>
            </div>

            {/* Codebox-like terminal logs display */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-[10px] leading-relaxed space-y-3.5 shadow-inner overflow-x-auto">
              {systemLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2 text-wrap">
                  <span className="text-emerald-500 font-bold shrink-0">{log.timestamp.split('T')[1].split('-')[0]}</span>
                  <span className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                    log.type === 'WARN' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'
                  }`}>{log.type}</span>
                  <span className="text-slate-400 font-semibold shrink-0">[{log.module}]</span>
                  <span className="text-slate-200">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
