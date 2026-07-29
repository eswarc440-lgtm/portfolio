import React, { useState } from 'react';
import { 
  Target, Calendar, Award, Flame, Star, Sparkles, CheckCircle2, 
  Plus, Trash2, ArrowUpRight, Check, Zap, AlertCircle 
} from 'lucide-react';
import { Goal, Challenge, ActivityCategory, Badge } from '../types';
import { DEFAULT_BADGES, DEFAULT_CHALLENGES } from '../utils/emissions';

interface GoalsChallengesProps {
  userProfile: any;
  goals: Goal[];
  challenges: Challenge[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'userId' | 'progress' | 'createdAt' | 'status'>) => void;
  onDeleteGoal: (id: string) => void;
  onCompleteChallenge: (id: string, xpReward: number, co2Saved: number) => void;
  onUpdateGoalProgress: (id: string, newProgress: number) => void;
}

export default function GoalsChallenges({ 
  userProfile, goals, challenges, onAddGoal, onDeleteGoal, onCompleteChallenge, onUpdateGoalProgress
}: GoalsChallengesProps) {
  
  // Custom goal creation state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory | 'all'>('all');
  const [reduction, setReduction] = useState<number>(20);
  const [deadline, setDeadline] = useState('');

  // Tab filter for challenges
  const [activeChallengeTab, setActiveChallengeTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || reduction <= 0 || !deadline) return;

    onAddGoal({
      title,
      category,
      targetReductionPercent: reduction,
      startCarbonValue: 120, // baseline average
      currentCarbonValue: 90,  // progress
      deadline
    });

    // Reset Form
    setTitle('');
    setCategory('all');
    setReduction(20);
    setDeadline('');
    setShowGoalForm(false);
  };

  const getChallengeEmoji = (cat: string) => {
    switch (cat) {
      case 'transport': return '🚗';
      case 'food': return '🍲';
      case 'electricity': return '⚡';
      case 'waste': return '🗑️';
      case 'travel': return '✈️';
      case 'shopping': return '🛍️';
      default: return '🌿';
    }
  };

  const currentLevel = Math.floor((userProfile?.totalXp || 0) / 100) + 1;
  const xpInCurrentLevel = (userProfile?.totalXp || 0) % 100;

  return (
    <div id="goals-challenges-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* LEFT COLUMN: Carbon Goals & Badges (5 columns) */}
      <div className="lg:col-span-5 space-y-8">
        
        {/* Profile Progress Block */}
        <div className="bg-gradient-to-tr from-emerald-900 to-green-950 p-6 rounded-3xl text-white shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] font-mono text-emerald-300">USER TELEMETRY RANK</span>
              <h2 className="text-xl font-bold">{userProfile?.name || 'Sarah Jenkins'}</h2>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex flex-col items-center justify-center font-bold text-lg">
              <span className="text-[9px] text-emerald-100 uppercase tracking-widest font-sans">LVL</span>
              {currentLevel}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-xs font-semibold text-emerald-100">
              <span>XP Milestone Progress</span>
              <span>{xpInCurrentLevel}/100 XP</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${xpInCurrentLevel}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-emerald-800 text-center">
            <div>
              <div className="text-xl font-bold text-emerald-300">{userProfile?.totalXp || 0}</div>
              <span className="text-[10px] text-emerald-100 uppercase font-mono">TOTAL XP</span>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-400">🔥 {userProfile?.currentStreak || 0}</div>
              <span className="text-[10px] text-emerald-100 uppercase font-mono">LOGGING STREAK</span>
            </div>
          </div>
        </div>

        {/* Goals block */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Active Carbon Goals</h2>
              <p className="text-xs text-gray-400">Set target reduction metrics for carbon categories</p>
            </div>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* New Goal Form */}
          {showGoalForm && (
            <form onSubmit={handleCreateGoal} className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-4 mb-6 animate-fade-in">
              <div className="text-xs font-bold text-gray-700">Set Custom Carbon Reduction Target</div>
              
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Goal Heading</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cut Commute Carbon"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Sector Scope</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ActivityCategory | 'all')}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white outline-none"
                  >
                    <option value="all">All Sectors</option>
                    <option value="transport">Travel (Scope 1)</option>
                    <option value="electricity">Power (Scope 2)</option>
                    <option value="food">Dietary Choices</option>
                    <option value="shopping">Consumer Goods</option>
                    <option value="waste">Refuse Sorting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Target Reduction %</label>
                  <input
                    type="number"
                    min="5"
                    max="90"
                    value={reduction}
                    onChange={(e) => setReduction(parseInt(e.target.value) || 20)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                >
                  Confirm Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-xs hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Goals list */}
          <div className="space-y-4">
            {goals.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs">
                No custom environmental goals currently active. Click '+' to deploy targets.
              </div>
            ) : (
              goals.map((g) => (
                <div key={g.id} className="p-4 bg-slate-50/50 rounded-2xl border border-gray-100 relative group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 flex items-center">
                        <Target className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                        {g.title}
                      </h4>
                      <span className="text-[9px] text-gray-400 font-mono capitalize">Sector: {g.category} • Target: -{g.targetReductionPercent}%</span>
                    </div>
                    <button
                      onClick={() => onDeleteGoal(g.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-gray-500">Milestone Progress</span>
                      <span className="text-emerald-700 font-bold">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-150 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${g.progress >= 100 ? 'bg-blue-500' : g.progress >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${g.progress}%` }}></div>
                    </div>
                  </div>

                  {/* Interactive Manual Log Progress */}
                  {g.status !== 'completed' && (
                    <div className="mt-3 pt-2.5 border-t border-dashed border-gray-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Record Goal Log:</span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => onUpdateGoalProgress(g.id, Math.max(0, g.progress - 10))}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[9px] font-mono font-extrabold transition-colors"
                          title="Subtract 10% progress"
                        >
                          -10%
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateGoalProgress(g.id, Math.min(100, g.progress + 15))}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-mono font-extrabold transition-colors"
                          title="Add 15% progress"
                        >
                          +15%
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateGoalProgress(g.id, 100)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[9px] font-mono font-extrabold transition-colors"
                          title="Mark goal as complete"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="text-[9px] text-gray-400 font-mono mt-3 flex items-center justify-between">
                    <span>Deadline: {g.deadline}</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-[9px] ${
                      g.progress >= 100 || g.status === 'completed'
                        ? 'text-blue-700 bg-blue-50 border border-blue-100'
                        : g.progress >= 80
                          ? 'text-amber-700 bg-amber-50 border border-amber-100'
                          : 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                    }`}>
                      {g.progress >= 100 || g.status === 'completed' ? 'COMPLETED' : g.progress >= 80 ? 'CLOSE TO TARGET' : 'ACTIVE'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Active Challenges (7 columns) */}
      <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Platform ESG Challenges</h2>
            <p className="text-xs text-gray-400">Collaborate or compete in active CO₂ reduction drills</p>
          </div>
          
          {/* Challenge type toggle filter */}
          <div className="flex space-x-1 border border-gray-100 bg-slate-50 p-1 rounded-xl">
            {['daily', 'weekly', 'monthly'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveChallengeTab(t as any)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors capitalize ${
                  activeChallengeTab === t 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges list */}
        <div className="space-y-4">
          {challenges
            .filter((c) => c.type === activeChallengeTab)
            .map((c) => {
              const isCompleted = c.completedBy.includes(userProfile?.id || '');
              return (
                <div 
                  key={c.id} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    isCompleted 
                      ? 'border-emerald-100 bg-emerald-50/20' 
                      : 'border-gray-100 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <span className="text-3xl p-2 bg-slate-50 rounded-xl">{getChallengeEmoji(c.category)}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-gray-900">{c.title}</h4>
                        {isCompleted && (
                          <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>COMPLETED</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 max-w-md mt-0.5">{c.description}</p>
                      
                      <div className="flex space-x-4 mt-2 font-mono text-[10px]">
                        <span className="text-emerald-700 font-bold flex items-center">
                          <Zap className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                          +{c.xpReward} XP
                        </span>
                        <span className="text-emerald-700 font-bold flex items-center">
                          🌱 -{c.co2SavedReward} kg CO₂e
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isCompleted}
                    onClick={() => onCompleteChallenge(c.id, c.xpReward, c.co2SavedReward)}
                    className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                      isCompleted 
                        ? 'bg-emerald-50 text-emerald-400 border border-emerald-100 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {isCompleted ? 'Rewards Redeemed' : 'Claim Reward'}
                  </button>
                </div>
              );
            })}
        </div>

        {/* Gamified Achievements Showcase */}
        <div className="border-t border-gray-100 mt-12 pt-8">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Planetary Badges Catalog</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {DEFAULT_BADGES.map((b) => {
              // Decide if unlocked based on simple milestones
              let unlocked = false;
              if (b.xpRequired && (userProfile?.totalXp || 0) >= b.xpRequired) unlocked = true;
              if (b.streakRequired && (userProfile?.currentStreak || 0) >= b.streakRequired) unlocked = true;
              if (b.co2SavedRequired && (userProfile?.totalXp || 0) >= b.co2SavedRequired * 2) unlocked = true; // proxy
              
              return (
                <div key={b.id} className={`p-4 rounded-2xl border text-center relative flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  unlocked 
                    ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-emerald-100/10 text-emerald-900' 
                    : 'border-dashed border-gray-200 bg-gray-50/50 text-gray-300'
                }`}>
                  <span className={`text-3xl ${unlocked ? 'grayscale-0 animate-bounce' : 'grayscale'}`}>
                    {b.icon === 'Compass' ? '🧭' : 
                     b.icon === 'Leaf' ? '🌿' : 
                     b.icon === 'ShieldAlert' ? '🛡️' : 
                     b.icon === 'TrendingDown' ? '📉' : 
                     b.icon === 'Flame' ? '🔥' : 
                     b.icon === 'CheckCircle' ? '♻️' : '🏆'}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold leading-tight">{b.title}</h5>
                    <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">{b.description}</p>
                  </div>
                  {unlocked && (
                    <span className="absolute top-1 right-2 text-[8px] font-bold text-emerald-600 font-mono">UNLOCKED</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
