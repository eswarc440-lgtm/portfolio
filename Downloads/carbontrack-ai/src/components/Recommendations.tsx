import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Zap, Car, Utensils, ShoppingBag, Trash2, Globe, 
  CheckCircle2, Plus, ArrowRight, RefreshCw, Filter, Search,
  ChevronDown, ChevronUp, Layers, TrendingDown, Target, ShieldCheck
} from 'lucide-react';
import { Activity, UserProfile, ActivityCategory, Recommendation } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface RecommendationsProps {
  activities: Activity[];
  userProfile: UserProfile | null;
  onApplyRecommendationAsGoal?: (title: string, category: ActivityCategory | 'all', reductionTarget: number) => void;
  onLogRecommendationAction?: (category: ActivityCategory, type: string, emissionsSaved: number) => void;
}

export default function Recommendations({ 
  activities, 
  userProfile, 
  onApplyRecommendationAsGoal,
  onLogRecommendationAction
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const [appliedRecIds, setAppliedRecIds] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<{ [recId: string]: number[] }>({});

  // Compute metrics summary
  const metrics = useMemo(() => {
    let transport = 0, electricity = 0, food = 0, shopping = 0, waste = 0, total = 0;
    activities.forEach(a => {
      total += a.emissions;
      if (a.category === 'transport' || a.category === 'travel') transport += a.emissions;
      else if (a.category === 'electricity') electricity += a.emissions;
      else if (a.category === 'food') food += a.emissions;
      else if (a.category === 'shopping') shopping += a.emissions;
      else if (a.category === 'waste') waste += a.emissions;
    });
    return { transport, electricity, food, shopping, waste, totalEmissions: total };
  }, [activities]);

  // Fetch AI Recommendations from server endpoint
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activities,
          metrics,
          userProfile
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch AI recommendations, using default fallback set", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activities.length]);

  // Handle toggling steps
  const toggleStep = (recId: string, stepIndex: number) => {
    setCompletedSteps(prev => {
      const current = prev[recId] || [];
      const updated = current.includes(stepIndex)
        ? current.filter(i => i !== stepIndex)
        : [...current, stepIndex];
      return { ...prev, [recId]: updated };
    });
  };

  // Handle applying recommendation as Goal or Action
  const handleApply = (rec: Recommendation) => {
    if (appliedRecIds.includes(rec.id)) return;
    setAppliedRecIds(prev => [...prev, rec.id]);

    const cat = rec.category === 'general' ? 'all' : (rec.category as ActivityCategory);
    if (onApplyRecommendationAsGoal) {
      onApplyRecommendationAsGoal(
        `Reduce ${rec.category.toUpperCase()} carbon via ${rec.title}`,
        cat,
        20
      );
    }
    if (onLogRecommendationAction && rec.category !== 'general') {
      onLogRecommendationAction(
        rec.category as ActivityCategory,
        `Applied Recommendation: ${rec.title}`,
        rec.estimatedCo2SavedKg
      );
    }
  };

  // Filter recommendations
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const matchesSearch = 
        rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || rec.category === selectedCategory;
      const matchesImpact = selectedImpact === 'all' || rec.impactLevel === selectedImpact;

      return matchesSearch && matchesCat && matchesImpact;
    });
  }, [recommendations, searchQuery, selectedCategory, selectedImpact]);

  // Aggregate savings
  const totalPotentialSavings = useMemo(() => {
    return recommendations.reduce((acc, rec) => acc + rec.estimatedCo2SavedKg, 0);
  }, [recommendations]);

  const activeAppliedSavings = useMemo(() => {
    return recommendations
      .filter(r => appliedRecIds.includes(r.id))
      .reduce((acc, rec) => acc + rec.estimatedCo2SavedKg, 0);
  }, [recommendations, appliedRecIds]);

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport': return <Car className="w-4 h-4 text-emerald-600" />;
      case 'electricity': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'food': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case 'waste': return <Trash2 className="w-4 h-4 text-slate-600" />;
      default: return <Globe className="w-4 h-4 text-teal-600" />;
    }
  };

  // Impact level badge styling
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'High Impact':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">HIGH IMPACT</span>;
      case 'Quick Win':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">QUICK WIN</span>;
      case 'Habit Shift':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">HABIT SHIFT</span>;
      default:
        return <span className="bg-purple-100 text-purple-800 border border-purple-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">STRATEGIC</span>;
    }
  };

  return (
    <div id="recommendations-hub-root" className="space-y-8 animate-fade-in">
      
      {/* Upper Banner Section */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-800/50 border border-emerald-700/50 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-300 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Sustainability Action Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white">
              Smart Carbon Recommendations
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/80 leading-relaxed">
              Personalized reduction strategies generated by analyzing your GHG telemetry. Adopt these micro-habits and goals to accelerate your journey to Net-Zero.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Analyzing Telemetry...' : 'Regenerate AI Insights'}</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-800/60">
          <div className="bg-emerald-950/60 border border-emerald-800/40 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono font-semibold text-emerald-300 block">TOTAL POTENTIAL SAVINGS</span>
            <span className="text-xl font-extrabold font-display text-white mt-1 block">
              {totalPotentialSavings.toFixed(1)} <span className="text-xs text-emerald-300 font-normal">kg CO₂e/mo</span>
            </span>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-800/40 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono font-semibold text-emerald-300 block">ACTIVE ADOPTED SAVINGS</span>
            <span className="text-xl font-extrabold font-display text-emerald-400 mt-1 block">
              {activeAppliedSavings.toFixed(1)} <span className="text-xs text-emerald-300 font-normal">kg CO₂e/mo</span>
            </span>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-800/40 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono font-semibold text-emerald-300 block">ACTIONS ADOPTED</span>
            <span className="text-xl font-extrabold font-display text-white mt-1 block">
              {appliedRecIds.length} / {recommendations.length} <span className="text-xs text-emerald-300 font-normal">plans</span>
            </span>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-800/40 rounded-2xl p-3.5">
            <span className="text-[10px] font-mono font-semibold text-emerald-300 block">CARBON SCORE IMPACT</span>
            <span className="text-xl font-extrabold font-display text-teal-300 mt-1 block">
              +{appliedRecIds.length * 4} <span className="text-xs text-emerald-300 font-normal">pts boost</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recommendations, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Domains' },
              { id: 'transport', label: 'Transport' },
              { id: 'electricity', label: 'Energy' },
              { id: 'food', label: 'Diet' },
              { id: 'shopping', label: 'Shopping' },
              { id: 'waste', label: 'Waste' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Secondary Impact Filter Row */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Filter By Impact:</span>
          {['all', 'High Impact', 'Quick Win', 'Habit Shift', 'Strategic'].map(imp => (
            <button
              key={imp}
              onClick={() => setSelectedImpact(imp)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                selectedImpact === imp
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {imp === 'all' ? 'All Impacts' : imp}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm animate-pulse space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded-md w-20"></div>
                </div>
                <div className="h-3 bg-slate-100 rounded-md w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="bg-white border border-emerald-100 rounded-2xl p-12 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching recommendations found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search query or filters. You can also click "Regenerate AI Insights" above to pull freshly updated strategies.
            </p>
          </div>
        ) : (
          filteredRecommendations.map((rec, idx) => {
            const isApplied = appliedRecIds.includes(rec.id);
            const isExpanded = expandedRecId === rec.id;
            const stepsDone = completedSteps[rec.id] || [];
            const stepsCount = rec.actionableSteps?.length || 0;
            const stepsCompletedCount = stepsDone.length;

            return (
              <motion.div
                key={rec.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className={`bg-white border rounded-2xl p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                  isApplied
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-emerald-100/90'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  
                  {/* Left Column: Icon + Content */}
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl shrink-0 mt-0.5">
                      {getCategoryIcon(rec.category)}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getImpactBadge(rec.impactLevel)}
                        <span className="text-[10px] font-mono font-bold text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded">
                          {rec.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ⏱ {rec.timeframe} • {rec.difficulty}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-800 font-display leading-snug">
                        {rec.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rec.description}
                      </p>

                      {/* Tag badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rec.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[9px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Savings Badge + Action Button */}
                  <div className="flex flex-row md:flex-col justify-between items-end gap-3 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase block">Est. Reduction</span>
                      <span className="text-lg font-extrabold font-display text-emerald-600">
                        -{rec.estimatedCo2SavedKg} <span className="text-xs font-normal text-slate-400">kg/mo</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <span>Action Steps</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleApply(rec)}
                        disabled={isApplied}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Adopted Goal</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Turn Into Eco Goal</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Expandable Action Steps Checklist */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-slate-100 space-y-3"
                    >
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>Action Checklist ({stepsCompletedCount} of {stepsCount} finished)</span>
                        <span className="text-[10px] font-mono text-emerald-600">
                          {Math.round((stepsCompletedCount / (stepsCount || 1)) * 100)}% complete
                        </span>
                      </div>

                      <div className="space-y-2">
                        {rec.actionableSteps.map((step, sIdx) => {
                          const isDone = stepsDone.includes(sIdx);
                          return (
                            <div
                              key={sIdx}
                              onClick={() => toggleStep(rec.id, sIdx)}
                              className={`p-2.5 rounded-xl text-xs flex items-center space-x-3 cursor-pointer transition-all border ${
                                isDone
                                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 line-through'
                                  : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                                isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isDone && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                              <span className="font-medium">{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
}
