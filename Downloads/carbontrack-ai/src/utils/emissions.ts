import { EmissionFactor, ActivityCategory, Challenge, Badge } from '../types';

export const DEFAULT_EMISSION_FACTORS: EmissionFactor[] = [
  // Transport (unit: km)
  { category: 'transport', type: 'Petrol Car', factor: 0.18, unit: 'km', description: 'Average gasoline passenger car' },
  { category: 'transport', type: 'Diesel Car', factor: 0.17, unit: 'km', description: 'Average diesel passenger car' },
  { category: 'transport', type: 'Electric Vehicle', factor: 0.05, unit: 'km', description: 'EV using average grid power' },
  { category: 'transport', type: 'Bus / Transit', factor: 0.08, unit: 'km', description: 'Standard city public transit bus' },
  { category: 'transport', type: 'Train / Metro', factor: 0.04, unit: 'km', description: 'Electric train or subway transit' },
  { category: 'transport', type: 'Bicycle / Walking', factor: 0.0, unit: 'km', description: 'Zero emission active transport' },

  // Electricity (unit: kWh)
  { category: 'electricity', type: 'Standard Grid', factor: 0.45, unit: 'kWh', description: 'Average national grid power' },
  { category: 'electricity', type: 'Green Power Plan', factor: 0.05, unit: 'kWh', description: 'Electricity plan with >80% renewables' },
  { category: 'electricity', type: 'Solar Panel System', factor: 0.02, unit: 'kWh', description: 'Lifecycle solar generation' },

  // Food (unit: meals)
  { category: 'food', type: 'Beef / Lamb Heavy Meal', factor: 6.50, unit: 'meals', description: 'Meal containing significant red meat' },
  { category: 'food', type: 'Poultry / Pork Meal', factor: 2.10, unit: 'meals', description: 'Meal with chicken, turkey, or pork' },
  { category: 'food', type: 'Fish / Seafood Meal', factor: 1.40, unit: 'meals', description: 'Meal centered around fish or seafood' },
  { category: 'food', type: 'Vegetarian Meal', factor: 0.80, unit: 'meals', description: 'No meat, includes dairy/eggs' },
  { category: 'food', type: 'Vegan Meal', factor: 0.50, unit: 'meals', description: 'Fully plant-based, dairy-free meal' },

  // Shopping (unit: items)
  { category: 'shopping', type: 'Clothing / Fashion', factor: 12.00, unit: 'items', description: 'Average garment or footwear item' },
  { category: 'shopping', type: 'Large Electronics', factor: 85.00, unit: 'items', description: 'Laptop, monitor, or home appliance' },
  { category: 'shopping', type: 'Small Gadget', factor: 15.00, unit: 'items', description: 'Smartphone, headphones, or accessories' },
  { category: 'shopping', type: 'General Goods', factor: 4.50, unit: 'items', description: 'Household, books, toys, etc.' },

  // Travel / Flights (unit: km)
  { category: 'travel', type: 'Short-haul Flight (<3h)', factor: 0.15, unit: 'km', description: 'Under 1500 km passenger flight' },
  { category: 'travel', type: 'Long-haul Flight (>3h)', factor: 0.11, unit: 'km', description: 'Over 1500 km passenger flight' },
  { category: 'travel', type: 'Hotel Stay (Night)', factor: 18.50, unit: 'nights', description: 'One night stay in standard hotel' },

  // Waste (unit: kg)
  { category: 'waste', type: 'Landfill Waste', factor: 0.50, unit: 'kg', description: 'Unsorted general refuse' },
  { category: 'waste', type: 'Organic Compost', factor: 0.10, unit: 'kg', description: 'Composted kitchen/garden scraps' },
  { category: 'waste', type: 'Recycled Waste', factor: 0.05, unit: 'kg', description: 'Paper, glass, plastic, metal sorted' }
];

export function calculateEmissions(category: ActivityCategory, type: string, quantity: number, customFactors?: EmissionFactor[]): number {
  const factors = customFactors || DEFAULT_EMISSION_FACTORS;
  const factorObj = factors.find(f => f.category === category && f.type === type);
  const factor = factorObj ? factorObj.factor : 0.5; // generic fallback
  return Number((quantity * factor).toFixed(2));
}

export const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Active Commute',
    description: 'Walk, cycle, or use electric transit for all trips today.',
    category: 'transport',
    type: 'daily',
    xpReward: 100,
    co2SavedReward: 4.5,
    completedBy: []
  },
  {
    id: 'c2',
    title: 'Green Chef',
    description: 'Eat 100% plant-based/vegan meals for the entire day.',
    category: 'food',
    type: 'daily',
    xpReward: 80,
    co2SavedReward: 5.2,
    completedBy: []
  },
  {
    id: 'c3',
    title: 'Power Saver',
    description: 'Unplug idle appliances and turn off all unneeded lights for 24 hours.',
    category: 'electricity',
    type: 'daily',
    xpReward: 50,
    co2SavedReward: 2.1,
    completedBy: []
  },
  {
    id: 'c4',
    title: 'Zero Waste Week',
    description: 'Compost all food scraps and fully recycle all sorted plastics/paper/metal.',
    category: 'waste',
    type: 'weekly',
    xpReward: 350,
    co2SavedReward: 15.0,
    completedBy: []
  },
  {
    id: 'c5',
    title: 'Public Transit Champion',
    description: 'Replace at least 5 car journeys this week with public transportation.',
    category: 'transport',
    type: 'weekly',
    xpReward: 300,
    co2SavedReward: 22.4,
    completedBy: []
  },
  {
    id: 'c6',
    title: 'Locally Sourced Diet',
    description: 'Eat locally sourced or home-grown organic meals for a week.',
    category: 'food',
    type: 'weekly',
    xpReward: 250,
    co2SavedReward: 12.0,
    completedBy: []
  },
  {
    id: 'c7',
    title: 'No-Fly Month',
    description: 'Refrain from any flight travel and favor video conferencing or local rail.',
    category: 'travel',
    type: 'monthly',
    xpReward: 1000,
    co2SavedReward: 150.0,
    completedBy: []
  },
  {
    id: 'c8',
    title: 'Minimalist Shopper',
    description: 'Purchase zero non-essential clothing or electronics for 30 days.',
    category: 'shopping',
    type: 'monthly',
    xpReward: 800,
    co2SavedReward: 85.0,
    completedBy: []
  }
];

export const DEFAULT_BADGES: Badge[] = [
  { id: 'b1', title: 'Carbon Scout', description: 'Log your first footprint activity.', icon: 'Compass', xpRequired: 50 },
  { id: 'b2', title: 'Plant-Based Pioneer', description: 'Save over 15kg of CO2 on plant diets.', icon: 'Leaf', co2SavedRequired: 15 },
  { id: 'b3', title: 'Eco Warrior', description: 'Reach 500 XP and sustain your carbon score.', icon: 'ShieldAlert', xpRequired: 500 },
  { id: 'b4', title: 'Transit Maestro', description: 'Log 5 public transit or cycling activities.', icon: 'TrendingDown', xpRequired: 300 },
  { id: 'b5', title: 'Streak Master', description: 'Maintain a 5-day sustainability logging streak.', icon: 'Flame', streakRequired: 5 },
  { id: 'b6', title: 'Zero Waste Guru', description: 'Save over 50kg of CO2 from waste reduction.', icon: 'CheckCircle', co2SavedRequired: 50 },
  { id: 'b7', title: 'Green Leader', description: 'Reach the top position on the Leaderboard.', icon: 'Award', xpRequired: 1000 }
];
