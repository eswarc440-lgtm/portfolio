export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  department?: string;
  createdAt: string;
  carbonScore: number; // calculated scale (e.g. 0-100, where 100 is excellent)
  totalXp: number;
  currentStreak: number;
  badges: string[]; // list of badge IDs unlocked
  completedChallenges?: string[]; // list of challenge IDs completed
  avatarUrl?: string; // profile picture URL or pre-set key
  settings?: {
    notificationsEnabled: boolean;
    measurementSystem: 'metric' | 'imperial';
    gpsTrackingAllowed: boolean;
    monthlyTargetCo2: number;
    disasterAlertRadius: number;
  };
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  totalCO2Saved: number; // in kg
  employeeCount: number;
  createdAt: string;
  departments: string[];
}

export type ActivityCategory = 'transport' | 'electricity' | 'food' | 'shopping' | 'travel' | 'waste';

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: ActivityCategory;
  type: string; // e.g., "Petrol Car", "Bus", "Beef", "Recycling"
  quantity: number;
  unit: string; // e.g., "km", "kWh", "meals", "kg"
  date: string; // YYYY-MM-DD
  emissions: number; // in kg CO2e
  notes?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface EmissionFactor {
  id?: string;
  category: ActivityCategory;
  type: string;
  factor: number; // kg CO2e per unit
  unit: string;
  description: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  category: ActivityCategory | 'all';
  targetReductionPercent: number;
  startCarbonValue: number; // base carbon emissions per week/month
  currentCarbonValue: number;
  deadline: string;
  progress: number; // 0 to 100
  createdAt: string;
  status: 'active' | 'completed' | 'failed';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory | 'general';
  type: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
  co2SavedReward: number; // kg CO2e
  completedBy: string[]; // user IDs who completed it
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  xpRequired?: number;
  co2SavedRequired?: number; // kg CO2e
  streakRequired?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface CarbonPredictionPoint {
  date: string;
  actual: number;
  predicted: number;
}

export interface Toast {
  id: string;
  message: string;
  description?: string;
  type: 'success' | 'warning' | 'info' | 'error';
  duration?: number;
}

export interface Recommendation {
  id: string;
  title: string;
  category: ActivityCategory | 'general';
  impactLevel: 'High Impact' | 'Quick Win' | 'Habit Shift' | 'Strategic';
  estimatedCo2SavedKg: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeframe: 'Immediate' | '1 Week' | '1 Month';
  description: string;
  actionableSteps: string[];
  tags: string[];
  applied?: boolean;
}

