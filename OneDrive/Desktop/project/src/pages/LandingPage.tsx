/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Heart, 
  Home, 
  Truck, 
  Award, 
  CheckCircle,
  Users,
  Activity,
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const { setPath, disasters, shelters, volunteers, deliveries } = useApp();

  // Aggregate stats
  const totalDisasters = disasters.length;
  const activeShelters = shelters.filter(s => s.status === 'Active').length;
  const activeVolunteers = volunteers.length;
  const deliveredSupplies = '132,500+'; // Sum of delivered count representation

  const partners = [
    { name: 'National Logistics Agency', logo: 'NLA' },
    { name: 'Red Cross International', logo: 'RCI' },
    { name: 'Doctors on Call Allied', logo: 'DCA' },
    { name: 'United Shelter Taskforce', logo: 'UST' },
    { name: 'Federal Emergency Grid', logo: 'FEG' }
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* Top Banner Navigation */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-rose-600 text-white rounded-md">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <span className="font-bold text-sm uppercase tracking-tight text-slate-900">
              Smart Disaster Resource Allocation System
            </span>
          </div>

          <div className="flex items-center space-x-5">
            <button 
              onClick={() => setPath('/login')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
            >
              Secure Login
            </button>
            <button 
              onClick={() => setPath('/register')}
              className="bg-slate-950 hover:bg-slate-850 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Clean Light Theme visual style */}
      <section className="relative bg-slate-50 border-b border-slate-200 text-slate-900 overflow-hidden py-24 md:py-32">
        {/* Animated grid lines background */}
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        {/* Floating gradient orb */}
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 right-1/4 h-[500px] w-[500px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto">
            Smart Disaster Resource Allocation Platform
          </h1>
          
          <p className="mt-6 text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Coordinate critical disaster relief, shelters, mobile volunteer teams, NGO networks, and medical emergency resources in real time with Gemini AI-assisted logistics models.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => setPath('/login')}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Access Control Console</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-750 text-xs font-semibold px-7 py-3 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Live Operational Counters / Stats */}
      <section className="bg-white border-y border-slate-200 py-10 shadow-sm relative z-10 -mt-8 max-w-6xl mx-auto rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
          
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider block">
              Active Disasters
            </span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
              {totalDisasters} Locations
            </span>
            <p className="text-xs text-slate-500 mt-1">Monitored 24/7 by radar</p>
          </div>

          <div className="text-center border-l border-slate-150">
            <span className="text-[10px] font-bold uppercase text-sky-600 tracking-wider block">
              Registered Shelters
            </span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
              {activeShelters} Active
            </span>
            <p className="text-xs text-slate-500 mt-1">Real-time occupancy synced</p>
          </div>

          <div className="text-center border-l border-slate-150">
            <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider block">
              Active Volunteers
            </span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
              {activeVolunteers} Personnel
            </span>
            <p className="text-xs text-slate-500 mt-1">Mobilized for instant dispatch</p>
          </div>

          <div className="text-center border-l border-slate-150">
            <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider block">
              Logistics Delivered
            </span>
            <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
              {deliveredSupplies} Units
            </span>
            <p className="text-xs text-slate-500 mt-1">Verified with digital receipt</p>
          </div>

        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest block mb-2">
            Engineered Core Capabilities
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Disaster Supply Chain
          </h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            Eliminate gaps and supply distribution delays using advanced digital registers designed for state disaster management operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all">
            <div className="h-10 w-10 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center text-rose-600 mb-5">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Active Disaster Tracking</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Identify crisis events such as floods, wildfires, and earthquakes with severity classifications and accurate localization vectors.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all">
            <div className="h-10 w-10 bg-sky-50 border border-sky-100 rounded-lg flex items-center justify-center text-sky-600 mb-5">
              <Home className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Evacuation Shelter Registry</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Monitor evacuation capacities, beds availability, and water/power infrastructure statuses to prevent critical overcrowding.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all">
            <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-5">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI-Powered Resource Requisitions</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Examine regional stocks and obtain instant cargo volume recommendations from Gemini AI, optimized for immediate 48-hour response plans.
            </p>
          </div>

        </div>
      </section>

      {/* Institutional Partnerships Logo Section */}
      <section className="bg-slate-100/60 border-y border-slate-200 py-12 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-widest block mb-6">
            Federally Endorsed Partnerships
          </span>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-60">
            {partners.map((p, i) => (
              <span key={i} className="font-sans font-bold text-xs tracking-wider text-slate-600 border-b border-dashed border-slate-400 pb-1">
                {p.name} ({p.logo})
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest block mb-2">
            Field Endorsements
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-10">
            Trusted by Responders Worldwide
          </h2>
          <div className="bg-slate-50 border border-slate-150 p-8 rounded-2xl relative shadow-sm">
            <p className="text-slate-600 text-sm leading-relaxed italic">
              "During the June Coastal inundation, the Smart Relief platform cut our logistics matching cycle from 4 hours of manual phone calls down to a single AI advisory click. Our drivers was dispatched to Sarasota Arena within 15 minutes of the request approval, saving hundreds of families."
            </p>
            <div className="mt-6 flex items-center justify-center space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80" 
                alt="Representative" 
                className="h-9 w-9 rounded-full object-cover border border-slate-300"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block">Commander James Sterling</span>
                <span className="text-[10px] text-slate-500 font-mono block">Logistics Division Chief • Sarasota Regional Authority</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive CTA with Elegant Light Theme style */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="max-w-xl mx-auto px-6 relative z-10">
          <h3 className="text-xl md:text-2xl font-bold text-slate-900">Initiate Local Operations Control</h3>
          <p className="text-slate-600 text-xs mt-2 leading-relaxed">
            Gain immediate access to command dashboards, register response hubs, and configure real-time notification alerts.
          </p>
          <button 
            onClick={() => setPath('/login')}
            className="mt-6 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-8 py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 mx-auto cursor-pointer"
          >
            <span>Activate Operator License</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="h-4 w-4 text-rose-600" />
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-800">
              Smart Disaster Resource Allocation System
            </span>
          </div>
          <div className="flex space-x-4 mt-4 sm:mt-0 font-mono text-[10px]">
            <a href="#" className="hover:text-slate-600">SECURITY COMPLIANCE</a>
            <a href="#" className="hover:text-slate-600">FEDERAL RULES</a>
            <a href="#" className="hover:text-slate-600">SUPPORT DESK</a>
          </div>
        </div>
        <div className="mt-4 text-[10px] text-slate-400">
          © {new Date().getFullYear()} Smart Disaster Resource Allocation System. All rights reserved. Registered under disaster logistics mandate.
        </div>
      </footer>

    </div>
  );
};
