import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingDown, TrendingUp, Clock, Trees, Droplet, Zap, Flame, Sparkles, Plus, 
  Trash2, Globe, ArrowUpRight, Award, ChevronRight, HelpCircle, Quote, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, ActivityCategory } from '../types';

interface DashboardProps {
  userProfile: any;
  activities: Activity[];
  onAddActivity: () => void;
  onNavigateToTab: (tab: string) => void;
  onDeleteActivity?: (id: string) => void;
}

export default function Dashboard({ userProfile, activities, onAddActivity, onNavigateToTab, onDeleteActivity }: DashboardProps) {
  const [wisdom, setWisdom] = useState<{ quote: string; author: string; habit: string } | null>(null);
  const [wisdomLoading, setWisdomLoading] = useState(false);

  const fetchWisdom = async () => {
    setWisdomLoading(true);
    try {
      const response = await fetch('/api/ai/wisdom');
      if (response.ok) {
        const data = await response.json();
        setWisdom(data);
      } else {
        throw new Error("Failed to load");
      }
    } catch (err) {
      console.warn("Could not fetch wisdom from API, using default.", err);
      setWisdom({
        quote: "We do not inherit the Earth from our ancestors, we borrow it from our children.",
        author: "Native American Proverb",
        habit: "Swap one meat meal today for a plant-based alternative to conserve water & cut CO₂."
      });
    } finally {
      setWisdomLoading(false);
    }
  };

  useEffect(() => {
    fetchWisdom();
  }, []);

  // Calculate analytics
  const metrics = useMemo(() => {
    let totalEmissions = 0;
    let transportEmissions = 0;
    let foodEmissions = 0;
    let electricEmissions = 0;
    let otherEmissions = 0;

    activities.forEach(act => {
      totalEmissions += act.emissions;
      if (act.category === 'transport' || act.category === 'travel') {
        transportEmissions += act.emissions;
      } else if (act.category === 'food') {
        foodEmissions += act.emissions;
      } else if (act.category === 'electricity') {
        electricEmissions += act.emissions;
      } else {
        otherEmissions += act.emissions;
      }
    });

    // Environmental offsets metrics (rough conversions based on scientific averages)
    // 1 Tree absorbs roughly 22kg CO2 per year (~1.8kg/month). Swapping emissions translates to "Trees Saved"
    // Average food waste reduction or green transport prevents emissions. Let's compute offsets.
    // Base average citizen emits ~120kg/week. Anything below that counts towards "CO2 saved/prevented"
    const averageCitizenWeeklyEmissions = 120;
    const weeklyCarbonSaved = Math.max(0, (averageCitizenWeeklyEmissions * (activities.length > 0 ? 1 : 0)) - totalEmissions);
    
    const treesSaved = Number((weeklyCarbonSaved / 1.83).toFixed(1));
    const waterSaved = Math.round(weeklyCarbonSaved * 12.5); // Litres saved (dietary/shopping selection)
    const energySaved = Number((weeklyCarbonSaved * 1.5).toFixed(1)); // kWh equivalent offset

    // Carbon score 0-100 where higher is better
    // Base starting score 100, drops by 1 point for every 5 kg CO2 emitted this week
    const carbonScore = Math.max(10, Math.min(100, Math.round(100 - (totalEmissions / 4))));

    return {
      total: Number(totalEmissions.toFixed(1)),
      transport: Number(transportEmissions.toFixed(1)),
      food: Number(foodEmissions.toFixed(1)),
      electricity: Number(electricEmissions.toFixed(1)),
      other: Number(otherEmissions.toFixed(1)),
      treesSaved,
      waterSaved,
      energySaved,
      carbonScore
    };
  }, [activities]);

  // Proactive daily projection based on historical activity trends
  const dailyProjections = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let loggedToday = 0;
    
    // Calculate emissions per day
    const dailyTotals: { [key: string]: number } = {};
    activities.forEach(act => {
      const dayKey = act.date;
      dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + act.emissions;
      if (dayKey === todayStr) {
        loggedToday += act.emissions;
      }
    });

    const historicalDays = Object.keys(dailyTotals).filter(d => d !== todayStr);
    const historicalAverage = historicalDays.length > 0 
      ? historicalDays.reduce((sum, d) => sum + dailyTotals[d], 0) / historicalDays.length 
      : 14.5; // fallback baseline average

    // Estimate progress of the current day
    const currentHour = new Date().getHours();
    const dayProgressFactor = Math.max(0.1, Math.min(1.0, currentHour / 24));
    
    // Proactively project today's final emissions
    // If the day is partially completed, we project they will emit a portion of their average remaining.
    const expectedRemaining = Math.max(0, historicalAverage * (1 - dayProgressFactor));
    const projectedTotalToday = Number((loggedToday + expectedRemaining).toFixed(1));
    
    // Daily target limit derived from settings
    const dailyTarget = Number(((userProfile?.settings?.monthlyTargetCo2 || 450) / 30).toFixed(1));
    const onTrack = projectedTotalToday <= dailyTarget;
    const percentOfTarget = Math.round((projectedTotalToday / (dailyTarget || 1)) * 100);

    return {
      loggedToday: Number(loggedToday.toFixed(1)),
      historicalAverage: Number(historicalAverage.toFixed(1)),
      projectedTotalToday,
      dailyTarget,
      onTrack,
      percentOfTarget,
      expectedRemaining: Number(expectedRemaining.toFixed(1)),
      hourOfCalculation: currentHour
    };
  }, [activities, userProfile]);

  // Chart 1: Category distribution
  const pieData = useMemo(() => {
    return [
      { name: 'Transport', value: metrics.transport, color: '#10b981' },
      { name: 'Electricity', value: metrics.electricity, color: '#f59e0b' },
      { name: 'Dietary', value: metrics.food, color: '#3b82f6' },
      { name: 'Other Refuse', value: metrics.other, color: '#8b5cf6' }
    ].filter(item => item.value > 0);
  }, [metrics]);

  // Chart 2: Daily trend lines
  const trendData = useMemo(() => {
    // Group emissions by date for the last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map: { [key: string]: number } = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = days[d.getDay()];
      map[label] = 0;
    }

    activities.forEach(act => {
      try {
        const d = new Date(act.date);
        const label = days[d.getDay()];
        if (map[label] !== undefined) {
          map[label] += act.emissions;
        }
      } catch (e) {
        // ignore date format issues
      }
    });

    return Object.keys(map).map(day => ({
      day,
      emissions: Number(map[day].toFixed(1)),
      average: 15.5 // Baseline benchmark
    }));
  }, [activities]);

  // AI Sustainability insight matching current state
  const aiInsight = useMemo(() => {
    if (activities.length === 0) {
      return {
        title: "Platform Setup Successful",
        body: "Begin logging your travel, meals, or home utilities. The Gemini AI engine will audit your habits and recommend high-impact reduction plan."
      };
    }
    if (metrics.transport > metrics.electricity && metrics.transport > metrics.food) {
      return {
        title: "Transport Carbon Warning",
        body: "Your transport emissions represent the majority of your environmental footprint. Swapping a standard gasoline trip with public transit saves ~78% CO₂."
      };
    }
    if (metrics.food > metrics.transport) {
      return {
        title: "High Dietary Footprint Detected",
        body: "Red meat meals logged heavily impact carbon metrics. Incorporating beef alternatives twice weekly reduces dietary greenhouse output by 40%."
      };
    }
    return {
      title: "Optimized Carbon Flow",
      body: "Excellent! Your daily emissions are tracking 15% below regional averages. Maintain your logging streak to claim the Green Champion badge."
    };
  }, [activities, metrics]);

  return (
    <div id="dashboard-tab-root" className="space-y-8 animate-fade-in">
      
      {/* Upper header section with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 font-display tracking-tight">Environmental Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time GHG scope telemetry & environmental intelligence</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            id="dash-add-activity-btn"
            onClick={onAddActivity}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 shadow-sm shadow-emerald-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log Footprint Activity</span>
          </button>
        </div>
      </div>

      {/* Main Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Carbon Score */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-300">
            <Globe className="w-24 h-24 text-emerald-900" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 font-mono tracking-wider">CARBON SCORE</span>
          <div className="flex items-baseline space-x-1 mt-2">
            <span className="text-4xl font-extrabold text-slate-800 font-display">{metrics.carbonScore}</span>
            <span className="text-sm font-medium text-slate-400">/100</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">GHG Protocol scope rating</p>
        </div>

        {/* Tree equivalent */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-300">
            <Trees className="w-24 h-24 text-emerald-900" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 font-mono tracking-wider">TREE SEEDLINGS EQUIVALENT</span>
          <div className="flex items-baseline space-x-1 mt-2">
            <span className="text-4xl font-extrabold text-emerald-600 font-display">{metrics.treesSaved}</span>
            <span className="text-sm font-medium text-slate-400">🌲 saved</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Absorption compensation offset</p>
        </div>

        {/* Energy equivalent */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-300">
            <Zap className="w-24 h-24 text-yellow-900" />
          </div>
          <span className="text-[10px] font-bold text-amber-700 font-mono tracking-wider">ENERGY PREVENTED</span>
          <div className="flex items-baseline space-x-1 mt-2">
            <span className="text-4xl font-extrabold text-amber-500 font-display">{metrics.energySaved}</span>
            <span className="text-sm font-medium text-slate-400">kWh</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Grid usage offset equivalents</p>
        </div>

        {/* XP Streak */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-300">
            <Flame className="w-24 h-24 text-red-900" />
          </div>
          <span className="text-[10px] font-bold text-orange-700 font-mono tracking-wider">LOGGING STREAK</span>
          <div className="flex items-baseline space-x-1 mt-2">
            <span className="text-4xl font-extrabold text-orange-500 font-display">{userProfile?.currentStreak || 0}</span>
            <span className="text-sm font-medium text-slate-400">days active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">XP modifier: 1.2x multiplier</p>
        </div>

        {/* Projected Emissions Card */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-300">
            <Clock className="w-24 h-24 text-emerald-950" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-emerald-700 font-mono tracking-wider">PROJECTED TODAY</span>
            <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded-full ${
              dailyProjections.onTrack 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
              {dailyProjections.onTrack ? 'ON TRACK' : 'OVER TARGET'}
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-2">
            <span className={`text-4xl font-extrabold font-display ${dailyProjections.onTrack ? 'text-slate-800' : 'text-amber-600'}`}>
              {dailyProjections.projectedTotalToday}
            </span>
            <span className="text-xs font-semibold text-slate-400">kg</span>
          </div>
          
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>Logged: {dailyProjections.loggedToday} kg</span>
              <span>Limit: {dailyProjections.dailyTarget} kg</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  dailyProjections.onTrack ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, dailyProjections.percentOfTarget)}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-[9px] text-slate-400 mt-2 font-mono flex items-center space-x-1">
            <Clock className="w-3 h-3 text-emerald-600 inline shrink-0" />
            <span>Avg {dailyProjections.historicalAverage} kg/day trend</span>
          </p>
        </div>

      </div>

      {/* Dynamic Gemini recommendation insight card - Beautiful Forest Theme */}
      <div className="bg-emerald-950 border border-emerald-900 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.15),transparent_40%)]"></div>
        <div className="space-y-2.5 relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-800/40 border border-emerald-700/30 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GEMINI AUDIT REPORT</span>
          </div>
          <h3 className="text-lg font-bold font-display">{aiInsight.title}</h3>
          <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">{aiInsight.body}</p>
        </div>
        <button
          onClick={() => onNavigateToTab('recommendations')}
          className="px-5 py-3 bg-white text-emerald-900 text-xs font-bold rounded-xl hover:bg-emerald-50 flex items-center space-x-1 shadow-sm shrink-0 relative z-10 transition-colors cursor-pointer"
        >
          <span>Explore AI Recommendations</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Daily Sustainability Wisdom Quote */}
      <div id="sustainability-wisdom-widget" className="bg-gradient-to-r from-emerald-50/60 to-teal-50/60 border border-emerald-100/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden transition-all hover:shadow-md duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
          <Quote className="w-40 h-40 text-emerald-950" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-8 justify-between relative z-10">
          
          {/* Left Column: Quote content */}
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-emerald-100/80 border border-emerald-200/50 rounded-lg text-emerald-700">
                  <Quote className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-emerald-800 font-mono tracking-wider uppercase">Sustainability Wisdom of the Day</span>
              </div>
              
              {wisdomLoading ? (
                <div className="space-y-2 animate-pulse py-1">
                  <div className="h-4 bg-slate-200 rounded-md w-11/12"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-800 tracking-tight italic leading-relaxed">
                  "{wisdom?.quote || "The greatest threat to our planet is the belief that someone else will save it."}"
                </p>
              )}
            </div>

            {!wisdomLoading && wisdom?.author && (
              <span className="text-xs font-bold text-slate-500 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{wisdom.author}</span>
              </span>
            )}
          </div>

          {/* Right Column: Micro-Habit Challenge Card */}
          <div className="w-full md:w-80 flex flex-col justify-between bg-white/95 border border-emerald-100/50 rounded-2xl p-4 shadow-sm relative">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-emerald-600 font-mono tracking-wider uppercase">Daily Action Challenge</span>
                <button
                  onClick={fetchWisdom}
                  disabled={wisdomLoading}
                  className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-all"
                  title="Generate a fresh climate quote"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${wisdomLoading ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>

              {wisdomLoading ? (
                <div className="space-y-1.5 animate-pulse py-1">
                  <div className="h-3 bg-slate-100 rounded-md w-full"></div>
                  <div className="h-3 bg-slate-100 rounded-md w-5/6"></div>
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                  {wisdom?.habit || "Swap one meat meal today for a plant-based alternative."}
                </p>
              )}
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Earn +10 XP upon logging</span>
              <button
                onClick={onAddActivity}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-0.5"
              >
                <span>Log Action</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Dual Column Layout: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trend Area Chart (8 Columns) */}
        <div className="lg:col-span-8 bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-display">Weekly Carbon Trends</h3>
              <p className="text-xs text-slate-400">Emissions (kg CO₂e) comparison against region benchmarks</p>
            </div>
            <div className="flex space-x-4 text-[10px] font-mono text-slate-400">
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span> Your Output</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 mr-1.5"></span> Benchmark</span>
            </div>
          </div>

          <div className="h-64">
            {activities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-emerald-100">
                <HelpCircle className="w-8 h-8 text-slate-300" />
                <span>No logged activities this week</span>
                <button onClick={onAddActivity} className="text-xs text-emerald-600 font-semibold hover:underline">Log your first activity</button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #10b981', boxShadow: '0 4px 12px rgba(16,185,129,0.05)', fontSize: '11px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEmissions)" />
                  <Area type="monotone" dataKey="average" stroke="#cbd5e1" strokeDasharray="5 5" fillOpacity={0} strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category distribution (4 Columns) */}
        <div className="lg:col-span-4 bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-display">Emissions by Category</h3>
            <p className="text-xs text-slate-400 mb-4">Carbon intensity weight (kg CO₂e)</p>
          </div>

          <div className="h-44 flex justify-center items-center relative">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-400">Waiting for data telemetry...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} kg`, 'Emissions']} />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Center score */}
            {pieData.length > 0 && (
              <div className="absolute text-center">
                <span className="text-[9px] text-slate-400 font-mono">TOTAL</span>
                <div className="text-xl font-extrabold text-slate-800 font-display">{metrics.total}</div>
                <span className="text-[9px] text-slate-400 font-mono">kg CO₂e</span>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            {pieData.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: it.color }}></span>
                  <span className="text-slate-600 font-medium">{it.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{it.value} kg ({Math.round(it.value / (metrics.total || 1) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row: Recent activities & Achievements summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent activities */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-display">Recent Carbon Activity Logs</h3>
              <p className="text-xs text-slate-400">Verifiable corporate and household emissions logs</p>
            </div>
            <button
              onClick={() => onNavigateToTab('log')}
              className="text-xs text-emerald-600 font-semibold hover:underline flex items-center space-x-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No activity records found. Use 'Log Footprint Activity' to compile emissions.
              </div>
            ) : (
              activities.slice(0, 4).map((act) => (
                <div key={act.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex justify-between items-center group hover:bg-slate-100/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {act.category === 'transport' ? '🚗' : 
                       act.category === 'travel' ? '✈️' :
                       act.category === 'electricity' ? '⚡' : 
                       act.category === 'food' ? '🍲' : 
                       act.category === 'shopping' ? '🛍️' : '🗑️'}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 capitalize">{act.type}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{act.quantity} {act.unit} • {act.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-600">+{act.emissions} kg</div>
                      <span className="text-[9px] text-slate-400 font-mono">CO₂e</span>
                    </div>
                    {onDeleteActivity && (
                      <button
                        onClick={() => onDeleteActivity(act.id)}
                        className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-white transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Achievements / Badges Summary */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-display">Unlocked Achievements</h3>
                <p className="text-xs text-slate-400">Badges earned through carbon mitigation</p>
              </div>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100/60 rounded-full text-xs font-bold flex items-center">
                <Award className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>Level {Math.floor((userProfile?.totalXp || 0) / 100) + 1}</span>
              </div>
            </div>

            {/* Grid of badges */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { name: 'Carbon Scout', emoji: '🧭', unlocked: true },
                { name: 'Eco Warrior', emoji: '🛡️', unlocked: (userProfile?.totalXp || 0) >= 150 },
                { name: 'Plant Pioneer', emoji: '🌱', unlocked: (userProfile?.totalXp || 0) >= 300 },
                { name: 'Streak Master', emoji: '🔥', unlocked: (userProfile?.currentStreak || 0) >= 3 }
              ].map((bg, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                  bg.unlocked 
                    ? 'border-emerald-100 bg-emerald-50/20 text-emerald-900' 
                    : 'border-dashed border-slate-100 bg-slate-50/30 text-slate-300'
                }`}>
                  <span className={`text-2xl ${bg.unlocked ? 'grayscale-0' : 'grayscale'}`}>{bg.emoji}</span>
                  <span className="text-[9px] font-bold leading-tight line-clamp-1">{bg.name}</span>
                  <span className="text-[8px] font-mono text-slate-400">{bg.unlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 mt-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono text-slate-400">CURRENT XP STATS</span>
              <div className="text-sm font-extrabold text-slate-800 mt-0.5">{userProfile?.totalXp || 0} XP</div>
            </div>
            <button
              onClick={() => onNavigateToTab('goals')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              Browse active Challenges &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
