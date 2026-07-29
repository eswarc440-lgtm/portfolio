import React from 'react';
import { Leaf, Award, Shield, Users, ArrowRight, Activity, Cpu, Sparkles, TrendingDown, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const stats = [
    { value: '4.8K+', label: 'Active Personnel' },
    { value: '1.2M tons', label: 'Supplies Distributed' },
    { value: '250+', label: 'Shelters Registered' },
    { value: '18+', label: 'Response Sectors' }
  ];

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-emerald-600" />,
      title: 'Resource Optimization',
      description: 'Leverage smart allocation algorithms to predict shelter resource depletion and automatically coordinate restock routes.'
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-600" />,
      title: 'Emergency Registry',
      description: 'Real-time intake tracking for volunteers, NGOs, and shelter coordinators to prevent localized resource duplication.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-600" />,
      title: 'Logistics Gamification',
      description: 'Take on vital response missions and volunteer challenges. Earn XP, level up, and achieve Logistics Pro badges.'
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-600" />,
      title: 'Interactive GIS Overlays',
      description: 'View active disaster warning buffers, logistics routes, and shelter capacity densities overlaying standard maps.'
    },
    {
      icon: <TrendingDown className="w-6 h-6 text-emerald-600" />,
      title: 'Automated Supply Auditing',
      description: 'Generate production-ready audits, warehouse stock lists, delivery tracking receipts, and export seamlessly.'
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      title: 'Secure Governance',
      description: 'Engineered with durable Firebase configurations, strict role-based access authorization, and secure rule policies.'
    }
  ];

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#fafcf9] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Navbar */}
      <header id="landing-navbar" className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-emerald-50 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-xl">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-emerald-100">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-slate-800">Sattva <span className="text-emerald-600 font-medium text-xs font-mono uppercase tracking-wider">Platform</span></span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <a href="#features" className="hover:text-emerald-600 transition-colors">Platform Features</a>
          <a href="#mission" className="hover:text-emerald-600 transition-colors">Our Mission</a>
          <a href="#stats" className="hover:text-emerald-600 transition-colors">Impact Analytics</a>
          <a href="#quotes" className="hover:text-emerald-600 transition-colors">Philosophy</a>
        </nav>
        <div className="flex items-center space-x-3">
          <button 
            id="nav-signin-btn"
            onClick={onSignIn} 
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors uppercase tracking-wider"
          >
            Sign In
          </button>
          <button 
            id="nav-signup-btn"
            onClick={onGetStarted} 
            className="px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-200 transition-all uppercase tracking-wider"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Emergency Response Framework</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-slate-800 leading-none">
              🌍 Mobilize Today. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">Allocate Tomorrow.</span> <br />
              Protect Every Life.
            </h1>

            <p className="text-base text-slate-500 max-w-xl leading-relaxed">
              Enterprise emergency management platform helping disaster response coordinators, NGOs, and volunteers log, allocate, and track vital relief supplies with real-time GIS mapping.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                id="hero-get-started-btn"
                onClick={onGetStarted}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 group text-sm uppercase tracking-wider"
              >
                <span>Initialize Platform</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                id="hero-watch-demo-btn"
                onClick={onGetStarted}
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-emerald-100 shadow-sm flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 text-sm uppercase tracking-wider"
              >
                <span>Launch Interactive Demo</span>
              </button>
            </div>

            {/* Micro details */}
            <div className="flex items-center space-x-6 text-[10px] text-slate-400 pt-2 font-mono">
              <span className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span> ISO 22301 READY</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span> FEMA LOGISTICS ALIGNED</span>
            </div>
          </div>

          {/* Interactive Demo Preview Frame / Globe Visual */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-green-100 rounded-3xl filter blur-3xl opacity-60 -z-10 animate-pulse"></div>
            <div className="bg-white/85 border border-emerald-100 backdrop-blur-md rounded-3xl p-6 shadow-xl relative">
              <div className="flex justify-between items-center mb-6 border-b border-emerald-50 pb-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/30">disaster_logistics.yaml</div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-emerald-800 tracking-wider font-mono font-bold">SUPPLY MONITORING</span>
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
                  </div>
                  <p className="text-xs text-emerald-950 font-medium">"Optimal delivery! Distributing bottled water to Shelter Sector 4 has completed. Your regional coverage score is now **94%**."</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Lives Safeguarded</span>
                    <div className="text-lg font-extrabold text-slate-800 mt-1 font-display">12.4K 👤</div>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Depletion Redux</span>
                    <div className="text-lg font-extrabold text-emerald-600 mt-1 font-display">-41.5% ⬇️</div>
                  </div>
                </div>

                {/* Simulated Wave Chart */}
                <div className="h-28 bg-slate-50/50 rounded-xl border border-slate-150 flex items-end p-2 space-x-2 justify-between">
                  <div className="w-1/4 bg-slate-200 rounded-t h-[60%]"></div>
                  <div className="w-1/4 bg-slate-200 rounded-t h-[75%]"></div>
                  <div className="w-1/4 bg-slate-300 rounded-t h-[45%]"></div>
                  <div className="w-1/4 bg-gradient-to-t from-emerald-600 to-emerald-500 rounded-t h-[90%] flex items-center justify-center shadow-sm shadow-emerald-100"><span className="text-[9px] text-white font-bold font-mono">2026</span></div>
                </div>
              </div>
            </div>
            
            {/* Ambient Leaf/Particle graphics */}
            <div className="absolute -top-4 -right-4 w-11 h-11 bg-white rounded-full shadow-md border border-emerald-100 flex items-center justify-center text-lg animate-bounce">🌿</div>
            <div className="absolute -bottom-4 -left-4 w-11 h-11 bg-white rounded-full shadow-md border border-emerald-100 flex items-center justify-center text-lg animate-pulse">🌲</div>
          </div>
        </div>

        {/* Stats Strip */}
        <section id="stats" className="mt-24 bg-white border border-emerald-100 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center shadow-sm">
          {stats.map((st, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-3xl font-extrabold text-emerald-700 font-display">{st.value}</div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">{st.label}</div>
            </div>
          ))}
        </section>

        {/* Philosophy Quotes */}
        <section id="quotes" className="mt-28 border-t border-emerald-100/50 pt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-emerald-50/20 rounded-2xl border border-emerald-100/40 text-center relative">
              <span className="absolute -top-5 left-6 text-4xl text-emerald-200 font-serif">“</span>
              <p className="text-sm italic text-slate-700 leading-relaxed pt-2">
                "We do not inherit the Earth from our ancestors; we borrow it from our children."
              </p>
              <div className="text-[10px] font-mono font-bold tracking-wider text-emerald-800 mt-4 uppercase">— Indigenous Proverb</div>
            </div>
            <div className="p-6 bg-emerald-50/20 rounded-2xl border border-emerald-100/40 text-center relative">
              <span className="absolute -top-5 left-6 text-4xl text-emerald-200 font-serif">“</span>
              <p className="text-sm italic text-slate-700 leading-relaxed pt-2">
                "The greatest threat to our planet is the belief that someone else will save it."
              </p>
              <div className="text-[10px] font-mono font-bold tracking-wider text-emerald-800 mt-4 uppercase">— Robert Swan OBE</div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section id="features" className="mt-32 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-800">
              Comprehensive Sustainability Management Suite
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
              Everything required to monitor emissions, verify progress, and deploy sustainability culture throughout your workspace or home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((ft, idx) => (
              <div key={idx} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {ft.icon}
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2 font-display">{ft.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{ft.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission Statement */}
        <section id="mission" className="mt-32 bg-emerald-950 border border-emerald-900 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.1),transparent_50%)]"></div>
          <div className="relative max-w-3xl mx-auto space-y-6">
            <Globe className="w-12 h-12 text-emerald-400 mx-auto animate-spin-slow" />
            <h2 className="text-3xl md:text-4xl font-display font-extrabold">Mobilize. Coordinate. Deliver.</h2>
            <p className="text-sm text-emerald-200/90 leading-relaxed max-w-2xl mx-auto">
              Our mission is to streamline emergency logistical pathways by putting enterprise-grade response technology in the hands of field workers and agency leaders. We believe that with precise coordinate routing and real-time inventory synchronization, we can protect lives in active disaster theaters.
            </p>
            <div className="pt-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 mx-auto transition-all transform hover:-translate-y-0.5 text-xs uppercase tracking-wider"
              >
                <span>Deploy Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="landing-footer" className="bg-slate-50 border-t border-emerald-100/50 py-12 px-6 mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">S</div>
            <span className="font-display font-bold text-slate-700 text-sm">Sattva Platform</span>
          </div>
          <div>© 2026 Sattva Platform. Built for carbon tracking, ESG compliance, and eco-sustainability.</div>
          <div className="flex space-x-4 font-semibold">
            <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
