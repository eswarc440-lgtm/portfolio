/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NGO } from '../types';
import { Plus, Users, Globe, Phone, Mail, Award, X, Sparkles, Edit, Trash2 } from 'lucide-react';

export const Ngos: React.FC = () => {
  const { ngos, registerNGO, updateNGO, deleteNGO, currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNgo, setEditingNgo] = useState<NGO | null>(null);

  // NGO form
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');

  const isAuthorized = currentUser ? ['Super Admin', 'Disaster Management Authority', 'NGO', 'Shelter Manager'].includes(currentUser.role) : false;

  const handleOpenEditModal = (item: NGO) => {
    setEditingNgo(item);
    setName(item.name);
    setContact(item.contact);
    setEmail(item.email);
    setArea(item.area);
    setShowEditModal(true);
  };

  const handleEditNgoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNgo || !name || !contact || !email || !area) return;

    const updated: NGO = {
      ...editingNgo,
      name,
      contact,
      email,
      area
    };

    await updateNGO(updated);
    setShowEditModal(false);
    setEditingNgo(null);
    // Reset Form
    setName('');
    setContact('');
    setEmail('');
    setArea('');
  };

  const handleDeleteNgo = async (id: string) => {
    if (confirm('Are you absolutely sure you want to de-register and retire this NGO alliance partner from active relief registers?')) {
      await deleteNGO(id);
    }
  };

  const handleSubmitNGO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !email || !area) return;

    await registerNGO({
      name,
      contact,
      email,
      area
    });

    setShowAddModal(false);
    // Reset Form
    setName('');
    setContact('');
    setEmail('');
    setArea('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Strategic NGO Alliances</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">National and global humanitarian NGO coalitions active in sector.</p>
        </div>
        {isAuthorized && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Enroll NGO Partner</span>
          </button>
        )}
      </div>

      {/* Grid of NGOs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ngos.map(item => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">{item.name}</h4>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
                    NGO Partner • {item.area}
                  </span>
                </div>
              </div>
            </div>

             {/* Action buttons */}
            {isAuthorized && (
              <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-white p-1 rounded-xl shadow border border-slate-200 z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                  className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit NGO"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteNgo(item.id); }}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                  title="Delete NGO"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Metrics cards inside */}
            <div className="grid grid-cols-2 gap-2 mt-5 border-y border-slate-100 py-3 font-mono text-[10px] text-slate-500">
              <div>
                <span className="block font-sans text-slate-400 uppercase text-[9px] tracking-wide">Delivered Supply</span>
                <span className="font-extrabold text-sm text-slate-900 block mt-0.5">{item.completedDeliveries} cargos</span>
              </div>
              <div>
                <span className="block font-sans text-slate-400 uppercase text-[9px] tracking-wide">Performance Score</span>
                <span className="font-extrabold text-sm text-emerald-600 block mt-0.5">{item.performanceScore}% Index</span>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-slate-350" />
                <span>Hotline: {item.contact}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-slate-350" />
                <span>Operations: {item.email}</span>
              </div>
            </div>

            {/* Performance status indicator */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <div className="flex items-center space-x-1.5 text-indigo-600 font-bold">
                <Award className="h-4 w-4" />
                <span>SLA Tier-1 Priority Responder</span>
              </div>
              <span className="font-bold text-slate-700">Rating: {item.rating.toFixed(1)} ★</span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Enroll NGO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Enroll Strategic NGO Partner</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNGO} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">NGO Legal Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Save the Children Strategic" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Command hotline</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+1 (800) 555-0199" 
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">logistics Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="logistics@ngo.org" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Operational Districts / Areas</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Florida Districts 1 & 2" 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
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
                  Enroll Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingNgo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase">Modify Strategic NGO Parameters</h3>
              <button onClick={() => { setShowEditModal(false); setEditingNgo(null); }} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleEditNgoSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">NGO Legal Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Save the Children Strategic" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Command hotline</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+1 (800) 555-0199" 
                    value={contact} 
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">logistics Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="logistics@ngo.org" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Operational Districts / Areas</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Florida Districts 1 & 2" 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full border border-slate-200 focus:border-rose-500 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingNgo(null); }}
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

    </div>
  );
};
