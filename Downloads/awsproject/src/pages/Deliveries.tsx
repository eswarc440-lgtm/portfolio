/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Delivery } from '../types';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Compass, 
  ChevronRight, 
  AlertTriangle,
  Camera,
  Check,
  Inbox
} from 'lucide-react';

export const Deliveries: React.FC = () => {
  const { deliveries, updateDeliveryStatus, currentUser } = useApp();
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(deliveries[0] || null);

  // Delivery Proof states
  const [proofNote, setProofNote] = useState('');
  const [proofUploaded, setProofUploaded] = useState(false);

  const canDeliver = currentUser?.role === 'Super Admin' || currentUser?.role === 'Disaster Management Authority' || currentUser?.role === 'Volunteer' || currentUser?.role === 'NGO';

  const handleUpdateStatus = async (id: string, status: Delivery['status'], note?: string) => {
    await updateDeliveryStatus(id, status, note);
    // Sync active selection state
    setActiveDelivery(prev => prev ? { 
      ...prev, 
      status, 
      timeline: [
        ...prev.timeline, 
        { status, timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: note || `Status updated to ${status}` }
      ]
    } : null);
  };

  const handleMarkDelivered = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery) return;

    if (!proofNote) {
      alert('Please fill out the delivery handoff confirmation notes to complete receipt.');
      return;
    }

    await handleUpdateStatus(activeDelivery.id, 'Delivered', `Proof of Handoff: ${proofNote} (Digital image receipt attached)`);
    setProofNote('');
    setProofUploaded(false);
    alert('Logistics delivery completed successfully! Target shelter cots inventory stocks have been updated.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Pane: Cargo list */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Active Convoys Registry</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Real-time supply chain deliveries in transit.</p>
        </div>

        <div className="space-y-3">
          {deliveries.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
              <Inbox className="h-7 w-7 text-slate-300 mx-auto mb-2" />
              <span>No supply convoys currently dispatched.</span>
            </div>
          ) : (
            deliveries.map(item => {
              const isActive = activeDelivery?.id === item.id;
              return (
                <div 
                  key={item.id}
                  onClick={() => { setActiveDelivery(item); setProofNote(''); setProofUploaded(false); }}
                  className={`border rounded-xl p-4 bg-white hover:shadow-md transition-all cursor-pointer relative ${
                    isActive ? 'border-rose-500 shadow-md bg-rose-50/5' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-indigo-600 font-bold uppercase block">CONVOY TRACKER: #{item.id}</span>
                      <h4 className="text-xs font-extrabold text-slate-950 mt-1">{item.shelterName}</h4>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      item.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 font-mono flex items-center space-x-1.5">
                    <Truck className="h-3.5 w-3.5 text-slate-350" />
                    <span className="truncate max-w-[220px]">{item.vehicle}</span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>NGO: {item.ngoName}</span>
                    <span>ETA: {item.estimatedArrival}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Timeline & proof */}
      <div className="lg:col-span-7">
        {activeDelivery ? (
          <div className="space-y-6">
            
            {/* Delivery Timeline Block */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-950 flex items-center space-x-1.5">
                    <Compass className="h-5 w-5 text-indigo-600" />
                    <span>Real-time Timeline: Cargo #{activeDelivery.id}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">DESTINATION: {activeDelivery.shelterName}</p>
                </div>

                {canDeliver && activeDelivery.status !== 'Delivered' && (
                  <div className="flex items-center space-x-2">
                    {activeDelivery.status === 'Dispatched' && (
                      <button
                        onClick={() => handleUpdateStatus(activeDelivery.id, 'In Transit', 'Driver advanced past central containment border.')}
                        className="bg-slate-950 hover:bg-slate-850 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow cursor-pointer"
                      >
                        Start Transit
                      </button>
                    )}

                    {activeDelivery.status === 'In Transit' && (
                      <button
                        onClick={() => handleUpdateStatus(activeDelivery.id, 'Near Shelter', 'Convoy coordinates tracking within 500m of shelter coordinates.')}
                        className="bg-slate-950 hover:bg-slate-850 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow cursor-pointer"
                      >
                        Near Shelter
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Graphical Vertical Timeline */}
              <div className="mt-6 space-y-6 relative pl-6 border-l-2 border-slate-100">
                {activeDelivery.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle Node indicator on line */}
                    <span className="absolute -left-[31px] top-0.5 bg-white border-2 border-indigo-600 rounded-full h-4 w-4 flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                    </span>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{step.status}</h4>
                        <span className="text-[9px] text-slate-400 font-mono">{step.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Handoff (Receipt Proof) panel */}
            {canDeliver && activeDelivery.status !== 'Delivered' && (
              <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl">
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center space-x-1">
                  <Camera className="h-4 w-4 text-indigo-600" />
                  <span>Execute Cargo Handoff Confirmation</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Submit digital receipt log and notes to finalize supply chain delivery.</p>

                <form onSubmit={handleMarkDelivered} className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Receipt Handoff Notes</label>
                    <textarea
                      required
                      placeholder="e.g. Received by Captain Robert Shaw. Stock counted: 1,500 meals, 3,000L water dry-docked safely."
                      value={proofNote}
                      onChange={(e) => setProofNote(e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2.5 h-20 focus:outline-none"
                    />
                  </div>

                  {/* Simulate image upload */}
                  <div>
                    <span className="block font-bold text-slate-700 mb-1.5">Cargo Handoff Photo Proof (Unsplash Mock)</span>
                    {proofUploaded ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center space-x-2 font-semibold">
                        <Check className="h-4.5 w-4.5 text-emerald-600" />
                        <span>Handoff_Proof_Receipt.jpg successfully attached</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setProofUploaded(true)}
                        className="bg-white border border-dashed border-slate-300 hover:border-slate-400 p-4 rounded-xl text-center w-full transition-colors flex flex-col items-center justify-center space-y-1.5 cursor-pointer text-slate-500 hover:text-slate-700"
                      >
                        <Camera className="h-5 w-5 text-slate-400" />
                        <span className="font-bold">Simulate Photo Capture / Upload</span>
                        <span className="text-[10px] text-slate-400 block">Take picture of offloaded pallets</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-lg w-full shadow cursor-pointer text-center block mt-2"
                  >
                    Confirm Delivery & Release Responder
                  </button>
                </form>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
            Select a dispatched supply cargo from the registry list to load progress timelines.
          </div>
        )}
      </div>

    </div>
  );
};
