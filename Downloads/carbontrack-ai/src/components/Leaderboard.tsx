import React, { useState, useMemo } from 'react';
import { 
  Award, Search, ArrowUpRight, Shield, Flame, User, Users, Filter, 
  BarChart3, TrendingUp, Calendar, Zap, Activity as ActivityIcon, 
  CheckCircle2, Sparkles, Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Activity } from '../types';

interface LeaderboardProps {
  userProfile: any;
  activities?: Activity[];
}

export default function Leaderboard({ userProfile, activities = [] }: LeaderboardProps) {
  const [search, setSearch] = useState('');
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'employees' | 'activity' | 'departments'>('employees');
  const [graphTimeframe, setGraphTimeframe] = useState<'7d' | '30d'>('7d');

  // Static mock high-fidelity carbon performers
  const topPerformers = [
    { id: 'u1', name: 'Eswar Kumar', email: 'eswarc440@gmail.com', department: 'Engineering', carbonScore: 94, totalXp: 1250, currentStreak: 8, badges: ['b1', 'b2', 'b5', 'b7'] },
    { id: 'u2', name: 'Sarah Jenkins', email: 'sjenkins@disasterresponse.org', department: 'Product', carbonScore: 89, totalXp: 850, currentStreak: 5, badges: ['b1', 'b2', 'b5'] },
    { id: 'u3', name: 'Marcus Aurelius', email: 'maurelius@disasterresponse.org', department: 'Operations', carbonScore: 85, totalXp: 620, currentStreak: 4, badges: ['b1', 'b4'] },
    { id: 'u4', name: 'Elena Rostova', email: 'erostova@disasterresponse.org', department: 'Engineering', carbonScore: 82, totalXp: 540, currentStreak: 3, badges: ['b1', 'b2'] },
    { id: 'u5', name: 'David Kim', email: 'dkim@disasterresponse.org', department: 'Sales', carbonScore: 78, totalXp: 480, currentStreak: 3, badges: ['b1'] },
    { id: 'u6', name: 'Sophia Loren', email: 'sloren@disasterresponse.org', department: 'HR', carbonScore: 74, totalXp: 350, currentStreak: 2, badges: ['b1'] },
    { id: 'u7', name: 'James Carter', email: 'jcarter@disasterresponse.org', department: 'Marketing', carbonScore: 71, totalXp: 290, currentStreak: 1, badges: ['b1'] }
  ];

  // Dynamic departments ranking
  const departmentStats = [
    { name: 'Engineering', totalEmployees: 42, emissionsPerCapita: 12.4, totalCO2Saved: 850, rating: 'A+' },
    { name: 'Product Management', totalEmployees: 12, emissionsPerCapita: 14.2, totalCO2Saved: 320, rating: 'A' },
    { name: 'Operations', totalEmployees: 25, emissionsPerCapita: 18.5, totalCO2Saved: 480, rating: 'B+' },
    { name: 'Sales & BD', totalEmployees: 34, emissionsPerCapita: 22.1, totalCO2Saved: 510, rating: 'B' },
    { name: 'Marketing', totalEmployees: 18, emissionsPerCapita: 24.8, totalCO2Saved: 280, rating: 'C+' },
    { name: 'HR & People', totalEmployees: 8, emissionsPerCapita: 15.6, totalCO2Saved: 190, rating: 'A-' }
  ];

  // Inject current user into ranking dynamically if not present
  const resolvedPerformers = useMemo(() => {
    const list = [...topPerformers];
    const exists = list.some(p => p.email === userProfile?.email);
    if (!exists && userProfile) {
      list.push({
        id: userProfile.id,
        name: userProfile.name || 'Sarah Jenkins',
        email: userProfile.email,
        department: userProfile.department || 'Engineering',
        carbonScore: userProfile.carbonScore || 85,
        totalXp: userProfile.totalXp || 650,
        currentStreak: userProfile.currentStreak || 4,
        badges: userProfile.badges || ['b1', 'b2']
      });
    }
    // Sort by XP
    list.sort((a, b) => b.totalXp - a.totalXp);
    return list;
  }, [userProfile]);

  const filteredPerformers = useMemo(() => {
    if (!search) return resolvedPerformers;
    const q = search.toLowerCase();
    return resolvedPerformers.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.department.toLowerCase().includes(q)
    );
  }, [resolvedPerformers, search]);

  // Compute User Activity Graph Analytics
  const activityGraphData = useMemo(() => {
    const days = graphTimeframe === '7d' ? 7 : 30;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const shortDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Filter activities for this date
      const dayActivities = activities.filter(a => a.date === dateStr);
      
      let loggedEmissions = 0;
      let activityCount = dayActivities.length;

      dayActivities.forEach(a => {
        loggedEmissions += a.emissions || 0;
      });

      // Synthetic baseline curve if user logs are zero on certain days
      if (activityCount === 0) {
        // Provide pleasant demo baseline data points for rich visualization
        const seed = (i * 7 + 13) % 10;
        loggedEmissions = Number((12 + seed * 1.5).toFixed(1));
        activityCount = (i % 3 === 0) ? 2 : 1;
      }

      const co2Prevented = Number((Math.max(2, 28 - loggedEmissions)).toFixed(1));
      const xpEarned = activityCount * 25 + Math.round(co2Prevented * 2);

      result.push({
        date: shortDay,
        fullDate: dateStr,
        emissions: Number(loggedEmissions.toFixed(1)),
        co2Prevented,
        activities: activityCount,
        xpEarned
      });
    }

    return result;
  }, [activities, graphTimeframe]);

  // Category Distribution Data for Donut Chart
  const categoryDistribution = useMemo(() => {
    const catMap: { [key: string]: number } = {
      transport: 0,
      electricity: 0,
      food: 0,
      shopping: 0,
      waste: 0
    };

    if (activities.length > 0) {
      activities.forEach(a => {
        const cat = a.category === 'travel' ? 'transport' : a.category;
        catMap[cat] = (catMap[cat] || 0) + (a.emissions || 1);
      });
    } else {
      catMap.transport = 38;
      catMap.electricity = 26;
      catMap.food = 22;
      catMap.shopping = 14;
    }

    const COLORS = ['#10b981', '#f59e0b', '#f97316', '#a855f7', '#64748b'];
    return Object.entries(catMap).map(([name, value], index) => ({
      name: name.toUpperCase(),
      value: Number(value.toFixed(1)),
      color: COLORS[index % COLORS.length]
    }));
  }, [activities]);

  const activityStatsSummary = useMemo(() => {
    const totalLogs = activities.length > 0 ? activities.length : 18;
    const totalEmissions = activityGraphData.reduce((acc, d) => acc + d.emissions, 0);
    const totalSaved = activityGraphData.reduce((acc, d) => acc + d.co2Prevented, 0);
    const totalXp = activityGraphData.reduce((acc, d) => acc + d.xpEarned, 0);

    return {
      totalLogs,
      totalEmissions: Number(totalEmissions.toFixed(1)),
      totalSaved: Number(totalSaved.toFixed(1)),
      totalXp,
      avgEmissions: Number((totalEmissions / (activityGraphData.length || 1)).toFixed(1))
    };
  }, [activities, activityGraphData]);

  const getRankBadge = (idx: number) => {
    switch (idx) {
      case 0: return <span className="w-6 h-6 rounded-full bg-yellow-400 text-yellow-950 font-bold flex items-center justify-center text-xs shadow-md">🥇</span>;
      case 1: return <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold flex items-center justify-center text-xs shadow-md">🥈</span>;
      case 2: return <span className="w-6 h-6 rounded-full bg-amber-600 text-amber-50 font-bold flex items-center justify-center text-xs shadow-md">🥉</span>;
      default: return <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-semibold flex items-center justify-center text-[10px] font-mono">{idx + 1}</span>;
    }
  };

  return (
    <div id="leaderboard-tab-root" className="space-y-8 animate-fade-in">
      
      {/* Top Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Hero Card & Podium */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          <div className="bg-gradient-to-tr from-emerald-700 via-teal-800 to-slate-900 p-6 rounded-3xl text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <Award className="w-9 h-9 text-emerald-300 animate-pulse" />
              <span className="bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                LEADERBOARD
              </span>
            </div>
            <h2 className="text-xl font-display font-extrabold text-white">Sustainability Champions</h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Recognizing active climate contributors across organizations. Track individual activity velocity, carbon offsets, and team department metrics in real-time.
            </p>
            <div className="bg-emerald-950/60 p-3.5 rounded-2xl border border-emerald-700/40 text-xs space-y-1">
              <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Weekly Activity Milestone:</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-snug">
                Engineering Department has prevented <strong className="text-emerald-400">850 kg CO₂e</strong> of transport emissions using active carpooling and electric transit.
              </p>
            </div>
          </div>

          {/* Podium visualization */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-5 text-center font-mono">
              🏆 Top 3 Leaders
            </h3>
            <div className="flex justify-around items-end h-36">
              {/* 2nd Place */}
              {resolvedPerformers[1] && (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">🥈</span>
                  <div className="text-center font-bold text-xs truncate w-20 text-slate-800">{resolvedPerformers[1].name.split(' ')[0]}</div>
                  <div className="w-16 bg-slate-100 rounded-t-xl h-20 border border-slate-200 mt-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono text-slate-600 font-bold">{resolvedPerformers[1].totalXp}XP</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {resolvedPerformers[0] && (
                <div className="flex flex-col items-center">
                  <span className="text-3xl">👑</span>
                  <div className="text-center font-extrabold text-xs truncate w-24 text-emerald-800">{resolvedPerformers[0].name.split(' ')[0]}</div>
                  <div className="w-20 bg-emerald-600 rounded-t-xl h-28 border border-emerald-700 mt-2 flex flex-col items-center justify-center text-white shadow-md">
                    <span className="text-xs font-black font-mono">{resolvedPerformers[0].totalXp}XP</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {resolvedPerformers[2] && (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">🥉</span>
                  <div className="text-center font-bold text-xs truncate w-20 text-slate-800">{resolvedPerformers[2].name.split(' ')[0]}</div>
                  <div className="w-16 bg-amber-50 rounded-t-xl h-14 border border-amber-200 mt-2 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono text-amber-800 font-bold">{resolvedPerformers[2].totalXp}XP</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tab Switcher & Main Content Panel */}
        <div className="lg:col-span-8 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
          
          {/* Main Navigation Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveLeaderboardTab('employees')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeLeaderboardTab === 'employees' 
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Leaderboard</span>
              </button>

              <button
                onClick={() => setActiveLeaderboardTab('activity')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeLeaderboardTab === 'activity' 
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>User Activity Graph</span>
              </button>

              <button
                onClick={() => setActiveLeaderboardTab('departments')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  activeLeaderboardTab === 'departments' 
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Department Metrics</span>
              </button>
            </div>

            {activeLeaderboardTab === 'employees' && (
              <div className="relative w-full sm:w-auto">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search champions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 py-1.5 border border-slate-200 rounded-xl text-xs outline-none w-full sm:w-48 bg-slate-50 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            )}
          </div>

          {/* TAB 1: Employees Leaderboard */}
          {activeLeaderboardTab === 'employees' && (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-none">
              {filteredPerformers.map((perf, idx) => {
                const isCurrentUser = perf.email === userProfile?.email;
                return (
                  <div 
                    key={perf.id} 
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      isCurrentUser 
                        ? 'border-emerald-400 bg-emerald-50/40 shadow-sm shadow-emerald-100' 
                        : 'border-slate-100 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {getRankBadge(idx)}
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center font-bold text-xs text-slate-700 uppercase shrink-0">
                        {perf.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 flex items-center truncate">
                          {perf.name}
                          {isCurrentUser && (
                            <span className="ml-2 bg-emerald-600 text-white text-[8px] font-mono px-1.5 py-0.5 rounded-full uppercase shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono capitalize block truncate">
                          {perf.department} department
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 shrink-0">
                      <div className="text-center">
                        <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">SCORE</span>
                        <span className="text-xs font-black text-emerald-600">{perf.carbonScore}/100</span>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">STREAK</span>
                        <span className="text-xs font-black text-amber-600">🔥 {perf.currentStreak}d</span>
                      </div>

                      <div className="text-right min-w-16">
                        <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">TOTAL XP</span>
                        <span className="text-xs font-extrabold text-slate-900">{perf.totalXp} XP</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: User Activity Graph & Detailed Telemetry */}
          {activeLeaderboardTab === 'activity' && (
            <div className="space-y-6">
              
              {/* Controls & Timeframe toggle */}
              <div className="flex justify-between items-center bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <ActivityIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">User Activity Velocity & Telemetry</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setGraphTimeframe('7d')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      graphTimeframe === '7d'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setGraphTimeframe('30d')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      graphTimeframe === '30d'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    30 Days
                  </button>
                </div>
              </div>

              {/* Activity Trend Graph (Area Chart) */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">
                    Emissions Logged vs CO₂ Prevented (kg)
                  </h4>
                  <div className="flex items-center space-x-4 text-[10px] font-bold">
                    <span className="flex items-center text-emerald-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span> CO₂ Prevented
                    </span>
                    <span className="flex items-center text-amber-600">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-1.5"></span> Logged Footprint
                    </span>
                  </div>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="preventedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="loggedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="co2Prevented" name="CO₂ Prevented (kg)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#preventedGrad)" />
                      <Area type="monotone" dataKey="emissions" name="Logged Footprint (kg)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#loggedGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Graph Grid: XP Gain & Category Pie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* XP Growth Bar Chart */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider mb-3">
                    Daily XP Velocity
                  </h4>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityGraphData.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px' }} />
                        <Bar dataKey="xpEarned" name="XP Earned" fill="#059669" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Donut Breakdown */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider mb-2">
                    Activity Domain Split
                  </h4>
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          innerRadius={35}
                          outerRadius={60}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff', fontSize: '11px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px', marginTop: '4px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: Department Metrics */}
          {activeLeaderboardTab === 'departments' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Active Employees</th>
                      <th className="pb-3">Carbon saved</th>
                      <th className="pb-3">Emissions/Capita</th>
                      <th className="pb-3 text-right">Scope Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {departmentStats.map((dept, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-bold text-slate-800">{dept.name}</td>
                        <td className="py-3 font-mono text-slate-600">{dept.totalEmployees} members</td>
                        <td className="py-3 font-semibold text-emerald-600">-{dept.totalCO2Saved} kg CO₂e</td>
                        <td className="py-3 font-mono text-slate-500">{dept.emissionsPerCapita} kg/employee</td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dept.rating.startsWith('A') 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : dept.rating.startsWith('B') 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {dept.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Embedded Activity Summary Strip across the bottom of Leaderboard */}
      <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-display flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>User Activity Telemetry & Performance Summary</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time activity logs feed directly into your weekly Leaderboard rank and XP multiplier.
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Leaderboard Multiplier: 1.5x Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Total Activity Logs</span>
            <span className="text-lg font-extrabold font-display text-slate-800 mt-1 block">
              {activityStatsSummary.totalLogs} <span className="text-xs font-normal text-slate-400">entries</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Footprint Logged</span>
            <span className="text-lg font-extrabold font-display text-amber-600 mt-1 block">
              {activityStatsSummary.totalEmissions} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Est. CO₂ Offset</span>
            <span className="text-lg font-extrabold font-display text-emerald-600 mt-1 block">
              {activityStatsSummary.totalSaved} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Activity XP Earned</span>
            <span className="text-lg font-extrabold font-display text-teal-600 mt-1 block">
              +{activityStatsSummary.totalXp} <span className="text-xs font-normal text-slate-400">XP</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Avg. Entry Footprint</span>
            <span className="text-lg font-extrabold font-display text-slate-700 mt-1 block">
              {activityStatsSummary.avgEmissions} <span className="text-xs font-normal text-slate-400">kg/log</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
