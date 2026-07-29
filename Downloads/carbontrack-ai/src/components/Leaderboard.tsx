import React, { useState, useMemo } from 'react';
import { Award, Search, ArrowUpRight, Shield, Flame, User, Users, Filter } from 'lucide-react';

interface LeaderboardProps {
  userProfile: any;
}

export default function Leaderboard({ userProfile }: LeaderboardProps) {
  const [search, setSearch] = useState('');
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'employees' | 'departments'>('employees');

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
        carbonScore: 80, // initial estimate
        totalXp: userProfile.totalXp || 50,
        currentStreak: userProfile.currentStreak || 1,
        badges: userProfile.badges || ['b1']
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

  const getRankBadge = (idx: number) => {
    switch (idx) {
      case 0: return <span className="w-6 h-6 rounded-full bg-yellow-400 text-yellow-950 font-bold flex items-center justify-center text-xs shadow-md">🥇</span>;
      case 1: return <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold flex items-center justify-center text-xs shadow-md">🥈</span>;
      case 2: return <span className="w-6 h-6 rounded-full bg-amber-600 text-amber-50 font-bold flex items-center justify-center text-xs shadow-md">🥉</span>;
      default: return <span className="w-6 h-6 rounded-full bg-gray-150 text-gray-500 font-semibold flex items-center justify-center text-[10px] font-mono">{idx + 1}</span>;
    }
  };

  return (
    <div id="leaderboard-tab-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* LEFT COLUMN: Top 3 Hero Cards (4 columns) */}
      <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
        <div className="bg-gradient-to-tr from-emerald-600 to-green-500 p-6 rounded-3xl text-white shadow-lg space-y-4">
          <Award className="w-10 h-10 text-emerald-100 animate-pulse" />
          <h2 className="text-xl font-sans font-extrabold">Sustainability Champions</h2>
          <p className="text-xs text-emerald-50 leading-relaxed">
            Encourage climate positive behaviors and build sustainable workspaces. High ranking employees earn specialized carbon offset benefits.
          </p>
          <div className="bg-emerald-500/30 p-3.5 rounded-2xl border border-emerald-400/20 text-xs">
            <div className="font-semibold text-white">🔥 This Week's Highlight:</div>
            <p className="text-emerald-100 mt-1">
              **Engineering Department** has prevented **850 kg CO₂e** of transport emissions using active rail carpooling schedules.
            </p>
          </div>
        </div>

        {/* Podium visualization */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-6 text-center">Platform Leader Podium</h3>
          <div className="flex justify-around items-end h-40">
            {/* 2nd Place */}
            {resolvedPerformers[1] && (
              <div className="flex flex-col items-center">
                <span className="text-2xl">🥈</span>
                <div className="text-center font-bold text-xs truncate w-20 text-gray-800">{resolvedPerformers[1].name.split(' ')[0]}</div>
                <div className="w-16 bg-slate-100 rounded-t-xl h-20 border border-slate-200 mt-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono text-gray-500">{resolvedPerformers[1].totalXp}XP</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {resolvedPerformers[0] && (
              <div className="flex flex-col items-center">
                <span className="text-3xl">👑</span>
                <div className="text-center font-extrabold text-xs truncate w-24 text-emerald-800">{resolvedPerformers[0].name.split(' ')[0]}</div>
                <div className="w-20 bg-emerald-500 rounded-t-xl h-28 border border-emerald-600 mt-2 flex flex-col items-center justify-center text-white">
                  <span className="text-xs font-bold font-mono">{resolvedPerformers[0].totalXp}XP</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {resolvedPerformers[2] && (
              <div className="flex flex-col items-center">
                <span className="text-2xl">🥉</span>
                <div className="text-center font-bold text-xs truncate w-20 text-gray-800">{resolvedPerformers[2].name.split(' ')[0]}</div>
                <div className="w-16 bg-amber-50 rounded-t-xl h-14 border border-amber-200 mt-2 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono text-gray-500">{resolvedPerformers[2].totalXp}XP</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Ledger Ranks (8 columns) */}
      <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        
        {/* Toggle headers */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveLeaderboardTab('employees')}
              className={`text-sm font-bold pb-2 border-b-2 transition-all ${
                activeLeaderboardTab === 'employees' 
                  ? 'border-emerald-600 text-gray-900' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Employee Rankings
            </button>
            <button
              onClick={() => setActiveLeaderboardTab('departments')}
              className={`text-sm font-bold pb-2 border-b-2 transition-all ${
                activeLeaderboardTab === 'departments' 
                  ? 'border-emerald-600 text-gray-900' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              Department Metrics
            </button>
          </div>

          {activeLeaderboardTab === 'employees' && (
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search champions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 py-1.5 border border-gray-200 rounded-lg text-xs outline-none w-full sm:w-48 bg-slate-50"
              />
            </div>
          )}
        </div>

        {/* Tab Canvas: Employees */}
        {activeLeaderboardTab === 'employees' ? (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredPerformers.map((perf, idx) => {
              const isCurrentUser = perf.email === userProfile?.email;
              return (
                <div 
                  key={perf.id} 
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isCurrentUser 
                      ? 'border-emerald-500 bg-emerald-50/20 shadow-sm shadow-emerald-50' 
                      : 'border-gray-100 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getRankBadge(idx)}
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-gray-600 uppercase">
                      {perf.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 flex items-center">
                        {perf.name}
                        {isCurrentUser && (
                          <span className="ml-2 bg-emerald-500 text-white text-[8px] font-mono px-1.5 py-0.5 rounded-full uppercase">YOU</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono capitalize">{perf.department} department</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">SCORE</span>
                      <span className="text-xs font-black text-emerald-600">{perf.carbonScore}/100</span>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">STREAK</span>
                      <span className="text-xs font-black text-orange-500">🔥 {perf.currentStreak}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">TOTAL XP</span>
                      <span className="text-xs font-extrabold text-gray-900">{perf.totalXp} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Tab Canvas: Departments */
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[10px] font-mono uppercase tracking-wider">
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Active Employees</th>
                    <th className="pb-3">Carbon saved</th>
                    <th className="pb-3">Emissions/Capita</th>
                    <th className="pb-3 text-right">Scope Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {departmentStats.map((dept, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-gray-800">{dept.name}</td>
                      <td className="py-3 font-mono text-gray-600">{dept.totalEmployees} members</td>
                      <td className="py-3 font-semibold text-emerald-600">-{dept.totalCO2Saved} kg CO₂e</td>
                      <td className="py-3 font-mono text-gray-500">{dept.emissionsPerCapita} kg/employee</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dept.rating.startsWith('A') 
                            ? 'bg-emerald-50 text-emerald-800' 
                            : dept.rating.startsWith('B') 
                              ? 'bg-amber-50 text-amber-800' 
                              : 'bg-red-50 text-red-800'
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
  );
}
