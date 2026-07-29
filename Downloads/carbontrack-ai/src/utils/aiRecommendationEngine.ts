import { Activity, Recommendation, UserProfile, ActivityCategory } from '../types';

/**
 * Advanced AI Recommendation Engine
 * Analyzes user activity patterns and generates personalized recommendations
 */

export interface ActivityMetrics {
  transport: number;
  electricity: number;
  food: number;
  shopping: number;
  waste: number;
  totalEmissions: number;
}

export interface UserBehavior {
  mostFrequentCategory: ActivityCategory | null;
  highestImpactCategory: ActivityCategory | null;
  activityFrequency: number; // activities per day
  consistencyScore: number; // 0-100, based on logging frequency
  topEmissionTypes: Array<{ type: string; emissions: number }>;
}

/**
 * Analyzes user activities to identify behavior patterns
 */
export function analyzeUserBehavior(activities: Activity[]): UserBehavior {
  if (activities.length === 0) {
    return {
      mostFrequentCategory: null,
      highestImpactCategory: null,
      activityFrequency: 0,
      consistencyScore: 0,
      topEmissionTypes: []
    };
  }

  // Calculate category frequency
  const categoryCount: Record<string, number> = {};
  const categoryEmissions: Record<string, number> = {};
  const typeEmissions: Record<string, number> = {};

  activities.forEach(act => {
    categoryCount[act.category] = (categoryCount[act.category] || 0) + 1;
    categoryEmissions[act.category] = (categoryEmissions[act.category] || 0) + act.emissions;
    typeEmissions[`${act.category}:${act.type}`] = (typeEmissions[`${act.category}:${act.type}`] || 0) + act.emissions;
  });

  // Find most frequent category
  const mostFrequentCategory = (
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] as ActivityCategory
  ) || null;

  // Find highest impact category
  const highestImpactCategory = (
    Object.entries(categoryEmissions).sort((a, b) => b[1] - a[1])[0]?.[0] as ActivityCategory
  ) || null;

  // Calculate activity frequency (per day)
  const uniqueDates = new Set(activities.map(a => a.date));
  const daySpan = Math.max(1, (Date.now() - new Date(activities[0].date).getTime()) / (1000 * 60 * 60 * 24));
  const activityFrequency = activities.length / Math.max(1, daySpan);

  // Consistency score: based on logging frequency (0-100)
  const consistencyScore = Math.min(100, Math.round(activityFrequency * 20));

  // Top emission types
  const topEmissionTypes = Object.entries(typeEmissions)
    .map(([key, emissions]) => {
      const [category, type] = key.split(':');
      return { type, emissions };
    })
    .sort((a, b) => b.emissions - a.emissions)
    .slice(0, 5);

  return {
    mostFrequentCategory,
    highestImpactCategory,
    activityFrequency,
    consistencyScore,
    topEmissionTypes
  };
}

/**
 * Calculate detailed activity metrics from activities array
 */
export function calculateActivityMetrics(activities: Activity[]): ActivityMetrics {
  const metrics: ActivityMetrics = {
    transport: 0,
    electricity: 0,
    food: 0,
    shopping: 0,
    waste: 0,
    totalEmissions: 0
  };

  activities.forEach(act => {
    if (act.category in metrics) {
      metrics[act.category as keyof ActivityMetrics] += act.emissions;
    }
    metrics.totalEmissions += act.emissions;
  });

  return metrics;
}

/**
 * Generate personalized recommendations based on user behavior
 */
export function generatePersonalizedRecommendations(
  behavior: UserBehavior,
  metrics: ActivityMetrics,
  userProfile: UserProfile | null
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Strategy 1: Target the highest emission category
  if (behavior.highestImpactCategory === 'transport' && metrics.transport > 0) {
    recommendations.push({
      id: 'rec-transport-1',
      title: 'Optimize Your Commute with Public Transit',
      category: 'transport',
      impactLevel: 'High Impact',
      estimatedCo2SavedKg: Math.round(metrics.transport * 0.4), // 40% reduction potential
      difficulty: 'Medium',
      timeframe: '1 Week',
      description: `Your transport footprint is ${metrics.transport.toFixed(1)} kg CO₂e. Switching 2-3 commute days to public transit or carpooling could reduce this by 30-50%.`,
      actionableSteps: [
        'Check local transit options and plan a route for your main commute',
        'Try one commute day with public transit to assess time/comfort',
        'Calculate potential savings and log transit trips in the app'
      ],
      tags: ['Public Transit', 'Commute', 'High Impact']
    });
  }

  if (behavior.highestImpactCategory === 'electricity' && metrics.electricity > 0) {
    recommendations.push({
      id: 'rec-electricity-1',
      title: 'Smart Home Energy Management',
      category: 'electricity',
      impactLevel: 'Strategic',
      estimatedCo2SavedKg: Math.round(metrics.electricity * 0.25), // 25% reduction potential
      difficulty: 'Easy',
      timeframe: '1 Month',
      description: `Your electricity footprint is ${metrics.electricity.toFixed(1)} kg CO₂e. Installing smart thermostats and power strips can reduce consumption by 15-25%.`,
      actionableSteps: [
        'Install a programmable thermostat with eco-mode',
        'Place smart power strips on entertainment and work areas',
        'Conduct a home energy audit to identify phantom power draws'
      ],
      tags: ['Energy Efficiency', 'Smart Home', 'Cost Savings']
    });
  }

  if (behavior.highestImpactCategory === 'food' && metrics.food > 0) {
    recommendations.push({
      id: 'rec-food-1',
      title: 'Transition to Plant-Based Meals',
      category: 'food',
      impactLevel: 'Habit Shift',
      estimatedCo2SavedKg: Math.round(metrics.food * 0.35), // 35% reduction potential
      difficulty: 'Medium',
      timeframe: '1 Month',
      description: `Your food footprint is ${metrics.food.toFixed(1)} kg CO₂e. Adopting 'Meatless Mondays' or plant-based lunches can reduce emissions by 30-40%.`,
      actionableSteps: [
        'Research plant-based protein sources (legumes, tofu, nuts)',
        'Choose one day per week to go fully vegetarian',
        'Log your plant-based meals to track carbon savings'
      ],
      tags: ['Dietary Shift', 'Health Benefits', 'Sustainable']
    });
  }

  // Strategy 2: Low-hanging fruit (Quick wins)
  recommendations.push({
    id: 'rec-quick-win-1',
    title: 'Eliminate Phantom Power Drain',
    category: 'electricity',
    impactLevel: 'Quick Win',
    estimatedCo2SavedKg: 5.2,
    difficulty: 'Easy',
    timeframe: 'Immediate',
    description: 'Standby power consumption accounts for 5-10% of household electricity. Unplugging devices or using smart power strips saves without lifestyle changes.',
    actionableSteps: [
      'Unplug phone chargers, coffee makers, and printers when not in use',
      'Use power strips with on/off switches for entertainment systems',
      'Set computers to sleep mode after 15 minutes of inactivity'
    ],
    tags: ['Quick Win', 'Energy Efficiency', 'Immediate']
  });

  // Strategy 3: Consistency-based recommendations
  if (behavior.consistencyScore > 60) {
    recommendations.push({
      id: 'rec-challenge-1',
      title: 'Take the Weekly Carbon Challenge',
      category: 'general',
      impactLevel: 'Habit Shift',
      estimatedCo2SavedKg: 15.0,
      difficulty: 'Medium',
      timeframe: '1 Week',
      description: 'You are consistent with logging activities. Challenge yourself to a weekly carbon reduction goal to accelerate your impact.',
      actionableSteps: [
        'Set a specific reduction target (e.g., reduce transport by 20%)',
        'Track daily progress and adjust habits in real-time',
        'Log all activities to measure actual savings vs. target'
      ],
      tags: ['Challenge', 'Gamification', 'Streak']
    });
  }

  // Strategy 4: Personalized based on profile carbon score
  if (userProfile?.carbonScore && userProfile.carbonScore < 50) {
    recommendations.push({
      id: 'rec-holistic-1',
      title: 'Holistic Carbon Reduction Pathway',
      category: 'general',
      impactLevel: 'High Impact',
      estimatedCo2SavedKg: 40.0,
      difficulty: 'Hard',
      timeframe: '1 Month',
      description: 'Your carbon score indicates room for significant improvement. A multi-category approach combining transport, energy, and diet changes can yield major results.',
      actionableSteps: [
        'Implement 1-2 changes in each of your top 3 emission categories',
        'Set monthly targets aligned with your lifestyle',
        'Review progress weekly and adjust strategies'
      ],
      tags: ['Holistic', 'Comprehensive', 'Long-term']
    });
  }

  // Strategy 5: Shopping/waste for users not yet tracking these
  if (metrics.shopping === 0 && metrics.waste === 0) {
    recommendations.push({
      id: 'rec-awareness-1',
      title: 'Start Tracking Consumption Footprint',
      category: 'shopping',
      impactLevel: 'Quick Win',
      estimatedCo2SavedKg: 8.0,
      difficulty: 'Easy',
      timeframe: 'Immediate',
      description: 'Most users overlook shopping and waste emissions. Tracking consumption can reveal surprising insights and unlock ~5-10% additional carbon savings.',
      actionableSteps: [
        'Log your next major purchase (electronics, clothing, furniture)',
        'Research carbon footprint of products before buying',
        'Prefer used/refurbished items when possible'
      ],
      tags: ['Consumption', 'Awareness', 'Behavioral Change']
    });
  }

  return recommendations;
}

/**
 * Rank recommendations by relevance and potential impact
 */
export function rankRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return recommendations.sort((a, b) => {
    // Prioritize by impact level
    const impactOrder = { 'High Impact': 3, 'Strategic': 2, 'Quick Win': 2, 'Habit Shift': 1 };
    const impactDiff = (impactOrder[a.impactLevel as keyof typeof impactOrder] || 0) - 
                       (impactOrder[b.impactLevel as keyof typeof impactOrder] || 0);
    if (impactDiff !== 0) return impactDiff;

    // Then by CO2 savings
    return b.estimatedCo2SavedKg - a.estimatedCo2SavedKg;
  });
}

/**
 * Cache key generator for API calls
 */
export function generateRecommendationsCacheKey(metrics: ActivityMetrics, userEmail: string): string {
  const metricsStr = `${metrics.transport}_${metrics.electricity}_${metrics.food}_${metrics.shopping}_${metrics.waste}`;
  return `recs_${userEmail}_${metricsStr}`;
}
