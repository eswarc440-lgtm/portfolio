import React, { useState, useMemo } from 'react';
import {
  TrendingUp, CheckCircle2, Clock, Target, Award, Zap, AlertCircle,
  BarChart3, Calendar, Flame, Leaf, Droplet, Wind
} from 'lucide-react';
import { Recommendation, Activity, ActivityCategory } from '../types';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface RecommendationTrackerProps {
  appliedRecommendations: Recommendation[];
  activities: Activity[];
  onCompleteRecommendation?: (recommendationId: string) => void;
}

interface RecommendationProgress {
  recommendationId: string;
  title: string;
  category: string;
  estimatedSavings: number;
  actualSavings: number;
  progressPercentage: number;
  status: 'in-progress' | 'completed' | 'stalled';
  daysActive: number;
  lastActivityDate: string;
}

export default function RecommendationTracker({
  appliedRecommendations,
  activities,
  onCompleteRecommendation
}: RecommendationTrackerProps) {
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);

  // Calculate progress for each applied recommendation
  const recommendationProgress = useMemo<RecommendationProgress[]>(() => {
    if (!appliedRecommendations.length) return [];

    return appliedRecommendations.map(rec => {
      // Find activities that relate to this recommendation's category
      const relatedActivities = activities.filter(a => 
        a.category === rec.category || (rec.category === 'general' && a.category)
      );

      // Calculate actual savings based on recent activities
      // Assuming recommendations are adopted, track how much user has reduced
      const totalActivityEmissions = relatedActivities.reduce((sum, a) => sum + a.emissions, 0);
      const averageEmissionPerActivity = relatedActivities.length > 0 
        ? totalActivityEmissions / relatedActivities.length 
        : 0;

      // Estimate actual savings as percentage of estimated
      const reductionPercentage = Math.min(100, Math.round((rec.estimatedCo2SavedKg / (rec.estimatedCo2SavedKg + averageEmissionPerActivity)) * 100) || 0);
      const actualSavings = (rec.estimatedCo2SavedKg * reductionPercentage) / 100;

      // Determine days active
      const createdDate = new Date();
      const daysActive = 1; // Placeholder - would need creation date from recommendation

      // Find last activity date for this category
      const lastActivity = relatedActivities
        .map(a => new Date(a.date))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      const daysSinceLastActivity = lastActivity 
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Determine status
      let status: 'in-progress' | 'completed' | 'stalled' = 'in-progress';
      if (reductionPercentage >= 80) status = 'completed';
      if (daysSinceLastActivity > 7) status = 'stalled';

      return {
        recommendationId: rec.id,
        title: rec.title,
        category: rec.category,
        estimatedSavings: rec.estimatedCo2SavedKg,
        actualSavings,
        progressPercentage: reductionPercentage,
        status,
        daysActive,
        lastActivityDate: lastActivity?.toISOString().split('T')[0] || 'Never'
      };
    });
  }, [appliedRecommendations, activities]);

  // Overall progress metrics
  const overallMetrics = useMemo(() => {
    if (!recommendationProgress.length) {
      return {
        totalPotentialSavings: 0,
        totalActualSavings: 0,
        completionRate: 0,
        averageProgressPercentage: 0,
        activePlans: 0,
        completedPlans: 0,
        stalledPlans: 0
      };
    }

    const totalPotentialSavings = recommendationProgress.reduce((sum, p) => sum + p.estimatedSavings, 0);
    const totalActualSavings = recommendationProgress.reduce((sum, p) => sum + p.actualSavings, 0);
    const completedPlans = recommendationProgress.filter(p => p.status === 'completed').length;
    const stalledPlans = recommendationProgress.filter(p => p.status === 'stalled').length;
    const activePlans = recommendationProgress.filter(p => p.status === 'in-progress').length;
    const averageProgressPercentage = Math.round(
      recommendationProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / recommendationProgress.length
    );

    return {
      totalPotentialSavings,
      totalActualSavings,
      completionRate: completedPlans,
      averageProgressPercentage,
      activePlans,
      completedPlans,
      stalledPlans
    };
  }, [recommendationProgress]);

  // Generate progress chart data
  const chartData = useMemo(() => {
    return recommendationProgress.slice(0, 5).map(p => ({
      title: p.title.substring(0, 12) + '...',
      actual: Number(p.actualSavings.toFixed(1)),
      estimated: p.estimatedSavings,
      progress: p.progressPercentage
    }));
  }, [recommendationProgress]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return <Wind className="w-4 h-4" />;
      case 'electricity': return <Zap className="w-4 h-4" />;
      case 'food': return <Leaf className="w-4 h-4" />;
      case 'shopping': return <Droplet className="w-4 h-4" />;
      case 'waste': return <Flame className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'stalled': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'stalled': return 'Stalled - Re-engage!';
      default: return 'In Progress';
    }
  };

  if (recommendationProgress.length === 0) {
    return (
      <div className="bg-white border border-emerald-100 rounded-2xl p-8 text-center space-y-3">
        <Target className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-base font-bold text-slate-600">No Active Recommendation Plans</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Adopt recommendations from the AI engine to start tracking your progress toward carbon reduction goals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Total Savings</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold font-display text-emerald-700">
              {overallMetrics.totalActualSavings.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-500 block">kg CO₂e / {overallMetrics.totalPotentialSavings.toFixed(1)} potential</span>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(overallMetrics.totalActualSavings / overallMetrics.totalPotentialSavings) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">Avg Progress</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold font-display text-blue-700">
              {overallMetrics.averageProgressPercentage}%
            </span>
            <span className="text-[10px] text-slate-500 block">across {recommendationProgress.length} active plans</span>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallMetrics.averageProgressPercentage}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">Completed</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold font-display text-amber-700">
              {overallMetrics.completedPlans}
            </span>
            <span className="text-[10px] text-slate-500 block">plans successfully completed</span>
            <div className="mt-3 flex space-x-1">
              {recommendationProgress.map((p, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${p.status === 'completed' ? 'bg-amber-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-[10px] font-mono font-bold text-red-700 uppercase">Stalled</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold font-display text-red-700">
              {overallMetrics.stalledPlans}
            </span>
            <span className="text-[10px] text-slate-500 block">plans need re-engagement</span>
            {overallMetrics.stalledPlans > 0 && (
              <div className="mt-2 px-2 py-1 bg-red-100 rounded text-[9px] font-semibold text-red-700">
                Take action to restart momentum
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Progress Chart */}
      {chartData.length > 0 && (
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Savings Progress Across Active Plans</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="title" tick={{ fontSize: 11 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ fontSize: 12, backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: any) => `${value.toFixed(1)} kg CO₂e`}
              />
              <Bar dataKey="actual" fill="#10b981" name="Actual Savings" radius={[8, 8, 0, 0]} />
              <Bar dataKey="estimated" fill="#d1d5db" name="Estimated Potential" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Individual Recommendation Progress Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Active Recommendation Plans</span>
        </h3>
        
        {recommendationProgress.map((progress, idx) => (
          <motion.div
            key={progress.recommendationId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedRecId(selectedRecId === progress.recommendationId ? null : progress.recommendationId)}
            className={`bg-white border rounded-2xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
              selectedRecId === progress.recommendationId ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3 flex-1">
                <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                  {getCategoryIcon(progress.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 gap-2 flex-wrap mb-1">
                    <h4 className="text-sm font-bold text-slate-800">{progress.title}</h4>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${getStatusColor(progress.status)}`}>
                      {getStatusBadge(progress.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Active {progress.daysActive}d</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Last: {progress.lastActivityDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-emerald-700 block">Actual Savings</span>
                <span className="text-lg font-extrabold font-display text-emerald-600">
                  {progress.actualSavings.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">/ {progress.estimatedSavings}kg</span>
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono font-bold text-slate-600">Progress</span>
                <span className="text-[10px] font-mono font-bold text-emerald-600">{progress.progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progressPercentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>

            {/* Expandable Details */}
            {selectedRecId === progress.recommendationId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-xs"
              >
                <div className="flex justify-between">
                  <span className="text-slate-600">Estimated Monthly Savings:</span>
                  <span className="font-bold text-emerald-700">{progress.estimatedSavings.toFixed(1)} kg CO₂e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Actual Achieved:</span>
                  <span className="font-bold text-emerald-700">{progress.actualSavings.toFixed(1)} kg CO₂e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className="font-bold capitalize">{progress.status}</span>
                </div>
                {progress.status === 'stalled' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Re-engage action
                    }}
                    className="w-full mt-3 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg transition-colors"
                  >
                    Re-engage This Plan
                  </button>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

    </div>
  );
}
