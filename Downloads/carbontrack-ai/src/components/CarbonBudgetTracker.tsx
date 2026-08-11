import React, { useMemo, useState } from 'react';
import {
  TrendingUp, TrendingDown, AlertCircle, Check, Target, Calendar,
  DollarSign, BarChart3, PieChart as PieChartIcon, Download, Plus, Edit, Trash2
} from 'lucide-react';
import { Activity, UserProfile } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';

interface CarbonBudgetTrackerProps {
  activities: Activity[];
  userProfile: UserProfile | null;
  onUpdateBudget?: (newBudgetKg: number) => void;
}

export default function CarbonBudgetTracker({ activities, userProfile, onUpdateBudget }: CarbonBudgetTrackerProps) {
  const [budgetPeriod, setBudgetPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newBudget, setNewBudget] = useState(userProfile?.settings?.monthlyTargetCo2 || 450);

  // Calculate budget metrics
  const budgetMetrics = useMemo(() => {
    const monthlyBudget = userProfile?.settings?.monthlyTargetCo2 || 450;
    const annualBudget = monthlyBudget * 12;
    const activeBudget = budgetPeriod === 'monthly' ? monthlyBudget : annualBudget;

    // Get current period emissions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let periodEmissions = 0;
    let daysUsed = 0;
    const dailyBreakdown: { date: string; emissions: number }[] = [];
    const dailyTotals: { [key: string]: number } = {};

    activities.forEach(act => {
      const actDate = new Date(act.date);
      
      if (budgetPeriod === 'monthly') {
        if (actDate.getMonth() === currentMonth && actDate.getFullYear() === currentYear) {
          periodEmissions += act.emissions;
          if (!dailyTotals[act.date]) {
            dailyTotals[act.date] = 0;
            daysUsed++;
          }
          dailyTotals[act.date] += act.emissions;
        }
      } else {
        if (actDate.getFullYear() === currentYear) {
          periodEmissions += act.emissions;
          if (!dailyTotals[act.date]) {
            dailyTotals[act.date] = 0;
            daysUsed++;
          }
          dailyTotals[act.date] += act.emissions;
        }
      }
    });

    // Generate daily breakdown
    Object.entries(dailyTotals).forEach(([date, emissions]) => {
      dailyBreakdown.push({ date, emissions });
    });
    dailyBreakdown.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const remaining = Math.max(0, activeBudget - periodEmissions);
    const spent = periodEmissions;
    const spentPercent = Math.round((spent / activeBudget) * 100);
    const dailyAverage = daysUsed > 0 ? spent / daysUsed : 0;
    const status = spentPercent <= 75 ? 'on-track' : spentPercent <= 100 ? 'warning' : 'exceeded';

    // Project end of period
    const daysInPeriod = budgetPeriod === 'monthly' ? 30 : 365;
    const daysRemaining = daysInPeriod - daysUsed;
    const projectedDailyAllowance = daysRemaining > 0 ? remaining / daysRemaining : 0;
    const canMaintain = projectedDailyAllowance > 0;

    return {
      budget: activeBudget,
      spent,
      remaining,
      spentPercent,
      status,
      daysUsed,
      daysInPeriod,
      dailyAverage: Number(dailyAverage.toFixed(2)),
      projectedDailyAllowance: Number(projectedDailyAllowance.toFixed(2)),
      canMaintain,
      dailyBreakdown
    };
  }, [activities, userProfile, budgetPeriod]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const breakdown: { [key: string]: number } = {};

    activities.forEach(act => {
      const actDate = new Date(act.date);
      const isCurrentPeriod = budgetPeriod === 'monthly'
        ? actDate.getMonth() === currentMonth && actDate.getFullYear() === currentYear
        : actDate.getFullYear() === currentYear;

      if (isCurrentPeriod) {
        breakdown[act.category] = (breakdown[act.category] || 0) + act.emissions;
      }
    });

    return Object.entries(breakdown).map(([category, emissions]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: Number(emissions.toFixed(1)),
      color: {
        transport: '#10b981',
        electricity: '#f59e0b',
        food: '#3b82f6',
        shopping: '#8b5cf6',
        waste: '#6b7280',
        travel: '#06b6d4'
      }[category] || '#999'
    }));
  }, [activities, budgetPeriod]);

  const handleSaveBudget = () => {
    if (onUpdateBudget && newBudget > 0) {
      onUpdateBudget(newBudget);
      setShowBudgetForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'exceeded': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return <Check className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'exceeded': return <TrendingUp className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 font-display">Carbon Budget Tracker</h1>
          <p className="text-sm text-slate-500">Monitor your {budgetPeriod === 'monthly' ? 'monthly' : 'annual'} carbon emissions budget</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setBudgetPeriod('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              budgetPeriod === 'monthly'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBudgetPeriod('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              budgetPeriod === 'annual'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Budget Status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-2xl p-6 shadow-sm ${getStatusColor(budgetMetrics.status)}`}
        >
          <div className="flex items-center space-x-3 mb-3">
            {getStatusIcon(budgetMetrics.status)}
            <span className="text-[10px] font-bold uppercase tracking-wider">Status</span>
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-extrabold capitalize">{budgetMetrics.status.replace('-', ' ')}</span>
            <span className="text-sm font-semibold">{budgetMetrics.spentPercent}% of budget used</span>
          </div>
        </motion.div>

        {/* Budget Remaining */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Remaining</span>
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-extrabold text-emerald-600">{budgetMetrics.remaining.toFixed(1)}</span>
            <span className="text-sm font-semibold text-slate-600">kg CO₂e remaining</span>
          </div>
        </motion.div>

        {/* Daily Average */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Daily Avg</span>
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-extrabold text-blue-600">{budgetMetrics.dailyAverage}</span>
            <span className="text-sm font-semibold text-slate-600">kg/day logged</span>
          </div>
        </motion.div>

        {/* Projection */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl p-6 shadow-sm border ${
            budgetMetrics.canMaintain
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex items-center space-x-2 mb-3">
            <TrendingDown className={`w-5 h-5 ${budgetMetrics.canMaintain ? 'text-emerald-600' : 'text-orange-600'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${budgetMetrics.canMaintain ? 'text-emerald-700' : 'text-orange-700'}`}>
              Sustainable
            </span>
          </div>
          <div className="space-y-2">
            <span className={`text-2xl font-extrabold ${budgetMetrics.canMaintain ? 'text-emerald-600' : 'text-orange-600'}`}>
              {budgetMetrics.projectedDailyAllowance}
            </span>
            <span className="text-sm font-semibold text-slate-600">kg/day allowance</span>
          </div>
        </motion.div>
      </div>

      {/* Budget Progress Bar */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Budget Consumption</h3>
            <p className="text-xs text-slate-500 mt-1">{budgetMetrics.spent.toFixed(1)} / {budgetMetrics.budget.toFixed(1)} kg CO₂e</p>
          </div>
          <button
            onClick={() => setShowBudgetForm(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Budget</span>
          </button>
        </div>

        {showBudgetForm && (
          <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-600 mb-1">New {budgetPeriod} Budget (kg CO₂e)</label>
                <input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={handleSaveBudget}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setShowBudgetForm(false)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Progress visualization */}
        <div className="space-y-3">
          <div className="relative w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                budgetMetrics.status === 'on-track'
                  ? 'bg-emerald-500'
                  : budgetMetrics.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, budgetMetrics.spentPercent)}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>0 kg</span>
            <span className="font-bold">{budgetMetrics.spentPercent}% used</span>
            <span>{budgetMetrics.budget.toFixed(0)} kg</span>
          </div>
        </div>
      </div>

      {/* Charts - Dual layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Daily Emissions Trend</h3>
          <div className="h-64">
            {budgetMetrics.dailyBreakdown.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={budgetMetrics.dailyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="emissions"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Emissions by Category</h3>
          <div className="h-64 flex items-center justify-center">
            {categoryBreakdown.length === 0 ? (
              <div className="text-slate-400 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} kg`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {categoryBreakdown.map((cat, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600">{cat.name}</span>
                </div>
                <span className="font-bold text-slate-800">{cat.value} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
