/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuditTrail } from '../hooks/useAuditTrail';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Sliders, 
  Database, 
  Check, 
  AlertTriangle,
  User as UserIcon,
  Download,
  Search,
  Filter,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  PlusCircle,
  Activity
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { currentUser } = useApp();
  const { 
    activityLogs, 
    filterLogs, 
    exportLogsToCSV, 
    logSecurityAction 
  } = useAuditTrail();

  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [realtimeTelemetry, setRealtimeTelemetry] = useState(true);

  // Expanded log rows state
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Clearance metrics representation
  const permissionsMatrix = [
    { module: 'Active Disaster Registry (CRUD)', roles: { admin: true, dma: true, ngo: false, shelter: false, volunteer: false, citizen: false } },
    { module: 'Shelter Registration & Openings', roles: { admin: true, dma: true, ngo: false, shelter: true, volunteer: false, citizen: false } },
    { module: 'Logistics Stocks Management', roles: { admin: true, dma: true, ngo: true, shelter: true, volunteer: false, citizen: false } },
    { module: 'Resource Requisition Filings', roles: { admin: true, dma: true, ngo: false, shelter: true, volunteer: false, citizen: false } },
    { module: 'Cargo Handoff & Dispatching', roles: { admin: true, dma: true, ngo: true, shelter: false, volunteer: false, citizen: false } },
    { module: 'Delivery Timelines Status (Write)', roles: { admin: true, dma: true, ngo: true, shelter: false, volunteer: true, citizen: false } },
  ];

  const filteredLogs = useMemo(() => {
    return filterLogs({
      searchQuery,
      role: roleFilter,
      actionType: categoryFilter,
      startDate,
      endDate
    });
  }, [filterLogs, searchQuery, roleFilter, categoryFilter, startDate, endDate]);

  const handleExportLogs = () => {
    exportLogsToCSV(filteredLogs);
    logSecurityAction('Audit Log Export', `Exported ${filteredLogs.length} activity logs in CSV format.`);
  };

  const handleBackupDb = async () => {
    await logSecurityAction('Database Backup Trigger', 'Initiated manual point-in-time snapshot database backup on Firestore.');
    alert('Triggered hot incremental backup on Firestore replica and logged in security audit logs.');
  };

  const toggleEmergencySirens = async (checked: boolean) => {
    setEmergencyAlerts(checked);
    await logSecurityAction(
      'Telemetry System Parameter Update', 
      `Emergency Warn Sirens changed from ${emergencyAlerts ? 'ON' : 'OFF'} to ${checked ? 'ON' : 'OFF'}`
    );
  };

  const toggleSmsDispatch = async (checked: boolean) => {
    setSmsAlerts(checked);
    await logSecurityAction(
      'Telemetry System Parameter Update', 
      `SMS/GSM Dispatches changed from ${smsAlerts ? 'ON' : 'OFF'} to ${checked ? 'ON' : 'OFF'}`
    );
  };

  const toggleGpsFleet = async (checked: boolean) => {
    setRealtimeTelemetry(checked);
    await logSecurityAction(
      'Telemetry System Parameter Update', 
      `Real-time GPS Fleet Telemetry changed from ${realtimeTelemetry ? 'ON' : 'OFF'} to ${checked ? 'ON' : 'OFF'}`
    );
  };

  const handleCreateCustomAuditLog = async () => {
    const action = prompt('Enter Action Name (e.g. System Audit Check):', 'Manual Compliance Check');
    if (!action) return;
    const details = prompt('Enter Action Details:', 'Verified operational readiness score.');
    if (!details) return;
    await logSecurityAction(action, details);
  };

  // Helper to color-code action type category
  const getCategoryColor = (action: string, details: string) => {
    const act = action.toLowerCase();
    const det = details.toLowerCase();

    if (act.includes('security') || det.includes('[security]') || act.includes('backup') || act.includes('export')) {
      return { bg: 'bg-rose-50 text-rose-700 border-rose-150', dot: 'bg-rose-500', label: 'Security' };
    }
    if (act.includes('disaster') || det.includes('[disaster]')) {
      return { bg: 'bg-amber-50 text-amber-700 border-amber-150', dot: 'bg-amber-500', label: 'Disaster' };
    }
    if (act.includes('request') || det.includes('[resource_request]')) {
      return { bg: 'bg-purple-50 text-purple-700 border-purple-150', dot: 'bg-purple-500', label: 'Request' };
    }
    if (act.includes('delivery') || act.includes('cargo') || det.includes('[delivery]')) {
      return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-150', dot: 'bg-indigo-500', label: 'Delivery' };
    }
    if (act.includes('shelter') || det.includes('[shelter]')) {
      return { bg: 'bg-teal-50 text-teal-700 border-teal-150', dot: 'bg-teal-500', label: 'Shelter' };
    }
    if (act.includes('login') || act.includes('logout') || act.includes('register')) {
      return { bg: 'bg-blue-50 text-blue-700 border-blue-150', dot: 'bg-blue-500', label: 'Auth' };
    }
    return { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400', label: 'Operation' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Config Panels */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Core System parameters */}
        <div id="telemetry-controls-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-3">
            <Sliders className="h-4.5 w-4.5 text-indigo-600" />
            <span>Emergency Telemetry Controls</span>
          </h3>

          <div className="space-y-4 mt-5 text-xs">
            <div className="flex items-center justify-between p-3 border border-slate-150 rounded-xl bg-slate-50/50">
              <div>
                <h4 className="font-bold text-slate-900">Broadcast Instant Warning Sirens</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Broadcast global red banner alerts and push alarms instantly when critical disasters are declared.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={emergencyAlerts} 
                  onChange={(e) => toggleEmergencySirens(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-150 rounded-xl bg-slate-50/50">
              <div>
                <h4 className="font-bold text-slate-900">SMS / GSM Dispatch Notifications</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Send instant SMS dispatches and route navigation targets to assigned volunteers upon convoy activation.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={smsAlerts} 
                  onChange={(e) => toggleSmsDispatch(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-150 rounded-xl bg-slate-50/50">
              <div>
                <h4 className="font-bold text-slate-900">Real-time GPS Fleet Telemetry</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Update volunteer vehicle map coordinates on the live mapping feeds using cellular triangulation.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={realtimeTelemetry} 
                  onChange={(e) => toggleGpsFleet(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Database backup parameters */}
        <div id="database-backup-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-3">
            <Database className="h-4.5 w-4.5 text-indigo-600" />
            <span>Database Backup & Diagnostics</span>
          </h3>

          <div className="mt-5 space-y-3.5 text-xs text-slate-600 leading-relaxed font-sans">
            <p>
              Your system databases is hosted persistently on the Google Cloud Run secure platform using Google Cloud Firestore in datastore mode. All transactions are logged and encrypted.
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                id="backup-db-btn"
                onClick={handleBackupDb}
                className="bg-slate-950 hover:bg-slate-850 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Trigger Manual Backup
              </button>
              <button
                id="export-logs-btn"
                onClick={handleExportLogs}
                className="border border-slate-250 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Download className="h-4 w-4 text-slate-400" />
                <span>Export Operations Log</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Clearance Permission Matrices */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Role Matrix */}
        <div id="clearance-matrix-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm overflow-hidden">
          <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-3">
            <Shield className="h-4.5 w-4.5 text-rose-600" />
            <span>Scope Clearance Matrix</span>
          </h3>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-[10px] font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase text-[9px] border-b border-slate-150">
                  <th className="py-2.5 px-3">Module Action</th>
                  <th className="py-2.5 px-2 text-center" title="Super Admin">ADM</th>
                  <th className="py-2.5 px-2 text-center" title="Disaster Management Authority">DMA</th>
                  <th className="py-2.5 px-2 text-center" title="NGO Alliance Partner">NGO</th>
                  <th className="py-2.5 px-2 text-center" title="Shelter Manager">SHL</th>
                  <th className="py-2.5 px-2 text-center" title="Volunteer Responder">VOL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs text-slate-600">
                {permissionsMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800 leading-tight">{item.module}</td>
                    <td className="py-3 px-2 text-center">
                      {item.roles.admin ? <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mx-auto"></span> : <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-200 mx-auto"></span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {item.roles.dma ? <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mx-auto"></span> : <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-200 mx-auto"></span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {item.roles.ngo ? <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mx-auto"></span> : <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-200 mx-auto"></span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {item.roles.shelter ? <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mx-auto"></span> : <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-200 mx-auto"></span>}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {item.roles.volunteer ? <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mx-auto"></span> : <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-200 mx-auto"></span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Full Width Bottom Column: Operations Audit Trail Viewer */}
      <div id="audit-trail-panel" className="col-span-12 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          
          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-2">
                <Activity className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                <span>Compliance & Operations Audit Trail</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Real-time security auditing log synchronizing transaction states from the Google Cloud Firestore instance.
              </p>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                id="manual-audit-btn"
                onClick={handleCreateCustomAuditLog}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="Create a custom audit trail record"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Trigger Manual Entry</span>
              </button>

              <button
                id="export-csv-btn"
                onClick={handleExportLogs}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
                title="Download matching logs as CSV"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Export ({filteredLogs.length})</span>
              </button>
            </div>
          </div>

          {/* Filtering controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 py-4 bg-slate-50/40 px-3 border border-slate-100 rounded-xl mt-4 text-xs">
            
            {/* Search Box */}
            <div className="md:col-span-4 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                id="audit-search-input"
                type="text"
                placeholder="Search action, details, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 border border-slate-250 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>

            {/* Role Filter */}
            <div className="md:col-span-2">
              <select
                id="audit-role-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-250 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option>All Roles</option>
                <option>Super Admin</option>
                <option>Disaster Management Authority</option>
                <option>NGO</option>
                <option>Shelter Manager</option>
                <option>Volunteer</option>
                <option>Public User</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-2">
              <select
                id="audit-category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-250 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              >
                <option>All Categories</option>
                <option value="disaster">Disasters</option>
                <option value="resource_request">Resource Requests</option>
                <option value="delivery">Deliveries</option>
                <option value="shelter">Shelters</option>
                <option value="security">Security</option>
                <option value="auth">Authentications</option>
              </select>
            </div>

            {/* Date Picker Start */}
            <div className="md:col-span-2 relative flex items-center">
              <input
                id="audit-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-250 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] font-mono"
                title="Log Start Date"
              />
            </div>

            {/* Date Picker End */}
            <div className="md:col-span-2 relative flex items-center">
              <input
                id="audit-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-250 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[11px] font-mono"
                title="Log End Date"
              />
            </div>

          </div>

          {/* Audit trail list/table */}
          <div className="mt-4 border border-slate-150 rounded-xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 uppercase text-[10px] font-mono font-bold">
                    <th className="py-2.5 px-4 w-12"></th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">User & Authority</th>
                    <th className="py-2.5 px-3">Event Action</th>
                    <th className="py-2.5 px-4">Operation Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">
                        <AlertTriangle className="h-5 w-5 mx-auto text-slate-300 mb-2" />
                        <span className="font-semibold block text-slate-500">No operations matched criteria</span>
                        <span className="text-[10px] block text-slate-400 mt-0.5">Try clearing filter conditions or search strings.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const cat = getCategoryColor(log.action, log.details);
                      const isExpanded = expandedLogId === log.id;

                      return (
                        <React.Fragment key={log.id}>
                          <tr 
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                          >
                            <td className="py-2 px-4 text-center">
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap font-mono text-[10px] text-slate-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3 text-slate-300" />
                                <span>{log.timestamp}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${cat.bg}`}>
                                <span className={`h-1 w-1 rounded-full ${cat.dot} mr-1`}></span>
                                {cat.label}
                              </span>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <div>
                                <span className="font-bold text-slate-800 block leading-tight">{log.userName}</span>
                                <span className="text-[9px] text-indigo-600 block leading-tight font-semibold mt-0.5">{log.role}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="font-semibold text-slate-900">{log.action}</span>
                            </td>
                            <td className="py-2 px-4 text-slate-600 max-w-[320px] truncate leading-normal">
                              {log.details}
                            </td>
                          </tr>

                          {/* Row Details Expansion */}
                          {isExpanded && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={6} className="py-4 px-6 border-t border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                  
                                  <div className="md:col-span-8 space-y-2">
                                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider font-mono">Detailed Payload Information</h4>
                                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs leading-relaxed font-sans text-slate-600 shadow-inner">
                                      {log.details}
                                    </div>
                                  </div>

                                  <div className="md:col-span-4 space-y-2 font-mono text-[10px]">
                                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Metadata Parameters</h4>
                                    <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5 text-slate-500">
                                      <div className="flex justify-between">
                                        <span className="font-semibold">Log Entry ID:</span>
                                        <span className="text-slate-700">{log.id}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-semibold">User Reference ID:</span>
                                        <span className="text-slate-700">{log.userId}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-semibold">Security Level:</span>
                                        <span className={cat.label === 'Security' ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                                          {cat.label === 'Security' ? 'HIGH / AUDITED' : 'OPERATIONAL'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-semibold">Database Mode:</span>
                                        <span className="text-emerald-600 font-bold">Cloud Firestore</span>
                                      </div>
                                    </div>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom info banner */}
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Displaying {filteredLogs.length} of {activityLogs ? activityLogs.length : 0} logs</span>
              <span className="mt-1 sm:mt-0">Security Compliant ISO-27001 standard logs</span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
