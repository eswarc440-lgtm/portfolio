import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc 
} from 'firebase/firestore';
import { 
  Leaf, LayoutDashboard, CalendarPlus, Map, Sparkles, Target, 
  Award, FileSpreadsheet, User, Settings as SettingsIcon, LogOut, ShieldAlert,
  ChevronLeft, ChevronRight, Menu, Bell, Search, Compass, Globe, CheckCircle2
} from 'lucide-react';

import { auth, db } from './firebase';
import { UserRole, UserProfile, Activity, Goal, Challenge, EmissionFactor, Toast } from './types';
import { DEFAULT_CHALLENGES, DEFAULT_EMISSION_FACTORS } from './utils/emissions';
import { motion, AnimatePresence } from 'motion/react';

// Sub-components
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ActivityLogging from './components/ActivityLogging';
import GoalsChallenges from './components/GoalsChallenges';
import Leaderboard from './components/Leaderboard';
import InteractiveMap from './components/InteractiveMap';
import Reports from './components/Reports';
import AdminDashboard from './components/AdminDashboard';
import Settings from './components/Settings';
import NotificationCenter from './components/NotificationCenter';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole>('USER');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Firestore sync states
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(DEFAULT_CHALLENGES);
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>(DEFAULT_EMISSION_FACTORS);

  // UI layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Emergency logistics audit compiles daily reports successfully",
    "Weekly transport reduction goal completed (+150 XP)",
    "Streak milestone unlocked: Logistics Pro"
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Toast Notification System
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'success', description?: string, duration = 5000) => {
    const id = `toast-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = { id, message, type, description, duration };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Define assigned role
        const assignedRole: UserRole = (user.email?.toLowerCase() === 'eswarc440@gmail.com' || user.email?.toLowerCase().includes('admin')) ? 'ADMIN' : 'USER';
        setUserRole(assignedRole);
        
        const initialProfile: UserProfile = {
          id: user.uid,
          email: user.email || (assignedRole === 'ADMIN' ? 'admin@sattva.org' : 'user@sattva.org'),
          name: user.displayName || (assignedRole === 'ADMIN' ? 'BMK Vamsi' : 'jashwanth'),
          role: assignedRole,
          createdAt: new Date().toISOString().split('T')[0],
          carbonScore: 84,
          totalXp: 120,
          currentStreak: 3,
          badges: ['b1'],
          avatarUrl: '',
          settings: {
            notificationsEnabled: true,
            measurementSystem: 'metric',
            gpsTrackingAllowed: true,
            monthlyTargetCo2: 450,
            disasterAlertRadius: 25
          }
        };
        setUserProfile(initialProfile);
        setCurrentTab('dashboard');

        // Fetch User telemetry from Firestore
        await syncUserData(user.uid, initialProfile);
      } else {
        // Check for mock auto-session
        const savedMock = localStorage.getItem('mock_user_session');
        if (savedMock) {
          const parsed = JSON.parse(savedMock);
          setCurrentUser(parsed.user);
          setUserRole(parsed.role);
          setUserProfile(parsed.profile);
          setCurrentTab('dashboard');
          
          // Seed mock activities
          const savedActs = localStorage.getItem('mock_activities');
          if (savedActs) {
            setActivities(JSON.parse(savedActs));
          } else {
            const seedActs: Activity[] = [
              { id: 'act-1', userId: parsed.user.uid, userName: parsed.profile.name, userEmail: parsed.user.email, category: 'transport', type: 'Petrol Car', quantity: 34, unit: 'km', date: new Date().toISOString().split('T')[0], emissions: 6.12, notes: 'Commute to Head Office' },
              { id: 'act-2', userId: parsed.user.uid, userName: parsed.profile.name, userEmail: parsed.user.email, category: 'electricity', type: 'Standard Grid', quantity: 15, unit: 'kWh', date: new Date().toISOString().split('T')[0], emissions: 6.75, notes: 'Office power consumption' },
              { id: 'act-3', userId: parsed.user.uid, userName: parsed.profile.name, userEmail: parsed.user.email, category: 'food', type: 'Vegan Meal', quantity: 2, unit: 'meals', date: new Date().toISOString().split('T')[0], emissions: 1.0, notes: 'Team organic lunch' }
            ];
            setActivities(seedActs);
            localStorage.setItem('mock_activities', JSON.stringify(seedActs));
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setCurrentTab('landing');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch / Initialize Firestore database structures
  const syncUserData = async (uid: string, initialProfile: UserProfile) => {
    try {
      // Setup / Fetch User node
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDocs(query(collection(db, 'users'), where('id', '==', uid)));
      
      let profile = initialProfile;
      if (userSnap.empty) {
        await setDoc(userRef, initialProfile);
      } else {
        profile = userSnap.docs[0].data() as UserProfile;
        setUserProfile(profile);
      }

      // Restore completed challenges state
      if (profile.completedChallenges) {
        const mappedChallenges = DEFAULT_CHALLENGES.map(ch => ({
          ...ch,
          completedBy: profile.completedChallenges?.includes(ch.id) ? [uid] : []
        }));
        setChallenges(mappedChallenges);
      }

      // Sync activities from Firestore
      const actQuery = query(collection(db, 'activities'), where('userId', '==', uid));
      const actSnap = await getDocs(actQuery);
      const actsList: Activity[] = [];
      actSnap.forEach((doc) => {
        actsList.push({ id: doc.id, ...doc.data() } as Activity);
      });
      setActivities(actsList);

      // Sync goals
      const goalsSnap = await getDocs(query(collection(db, 'goals'), where('userId', '==', uid)));
      const goalsList: Goal[] = [];
      goalsSnap.forEach((doc) => {
        goalsList.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(goalsList);

      // Sync custom ESG coefficients
      try {
        const factorsSnap = await getDocs(collection(db, 'emissionFactors'));
        if (!factorsSnap.empty) {
          const factorsList: EmissionFactor[] = [];
          factorsSnap.forEach((doc) => {
            factorsList.push({ id: doc.id, ...doc.data() } as any as EmissionFactor);
          });
          const merged = [...DEFAULT_EMISSION_FACTORS];
          factorsList.forEach(customFact => {
            const idx = merged.findIndex(f => f.category === customFact.category && f.type === customFact.type);
            if (idx !== -1) {
              merged[idx] = customFact;
            } else {
              merged.push(customFact);
            }
          });
          setEmissionFactors(merged);
        }
      } catch (fErr) {
        console.warn("Could not retrieve customized emission factors from Firestore:", fErr);
      }

    } catch (err) {
      console.warn("Firestore collection fetching encountered permissions error. Operating in secure offline cache sandbox mode.", err);
      // Fallback local memory seeding to ensure 100% immediate sandbox operation
      const savedActs = localStorage.getItem('mock_activities') || '[]';
      setActivities(JSON.parse(savedActs));
    }
  };

  const handleAuthSuccess = (user: any, role: UserRole) => {
    const profile: UserProfile = {
      id: user.uid,
      email: user.email,
      name: user.displayName || (role === 'ADMIN' ? 'BMK Vamsi' : 'jashwanth'),
      role: role,
      createdAt: new Date().toISOString().split('T')[0],
      carbonScore: 88,
      totalXp: 180,
      currentStreak: 4,
      badges: ['b1', 'b2']
    };

    // Cache to localstorage for instant recovery bypass
    localStorage.setItem('mock_user_session', JSON.stringify({ user, role, profile }));
    setCurrentUser(user);
    setUserRole(role);
    setUserProfile(profile);
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    localStorage.removeItem('mock_user_session');
    localStorage.removeItem('mock_activities');
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setActivities([]);
    setGoals([]);
    setCurrentTab('landing');
  };

  // Activity Actions
  const handleAddActivity = async (newAct: Omit<Activity, 'id' | 'userId' | 'userName' | 'userEmail'>) => {
    if (!currentUser || !userProfile) return;

    const activityId = `act-${Math.random().toString(36).substring(2, 9)}`;
    const activityData: Activity = {
      id: activityId,
      userId: currentUser.uid || 'mock-uid',
      userName: userProfile.name,
      userEmail: userProfile.email,
      ...newAct
    };

    const updatedActs = [activityData, ...activities];
    setActivities(updatedActs);
    localStorage.setItem('mock_activities', JSON.stringify(updatedActs));

    // Update Profile XP & sync
    const updatedProfile = {
      ...userProfile,
      totalXp: userProfile.totalXp + 20 // 20 XP per logged activity
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('mock_user_session', JSON.stringify({ user: currentUser, role: userRole, profile: updatedProfile }));

    // Auto-update matching goals' progress
    const matchingGoals = goals.filter(g => g.status === 'active' && (g.category === 'all' || g.category === newAct.category));
    if (matchingGoals.length > 0) {
      const updatedGoals = goals.map(g => {
        if (g.status === 'active' && (g.category === 'all' || g.category === newAct.category)) {
          const newProgress = Math.min(100, g.progress + 15);
          const isCompleted = newProgress === 100;
          
          // Trigger toast for close-to-target or completed
          if (newProgress >= 80 && newProgress < 100 && g.progress < 80) {
            addToast(
              "Goal Target Within Reach! 🎯",
              "warning",
              `You are at ${newProgress}% for '${g.title}' after logging this action. Almost there!`,
              5000
            );
          } else if (isCompleted && g.progress < 100) {
            addToast(
              "Goal Met successfully! 🎉",
              "success",
              `Congratulations! Your logged action achieved '${g.title}' (-${g.targetReductionPercent}% target reached).`,
              6000
            );
          }

          // Write to Firestore in background
          setDoc(doc(db, 'goals', g.id), { 
            progress: newProgress,
            status: isCompleted ? 'completed' : g.status 
          }, { merge: true }).catch(err => console.warn("Firestore goal update failed:", err));

          return {
            ...g,
            progress: newProgress,
            status: isCompleted ? ('completed' as const) : g.status
          };
        }
        return g;
      });
      setGoals(updatedGoals);
    }

    try {
      // Secure payload set
      await setDoc(doc(db, 'activities', activityId), activityData);
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
    } catch (e) {
      console.warn("Firestore entry blocked by security schema (running offline sandbox).", e);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    const updatedActs = activities.filter(a => a.id !== id);
    setActivities(updatedActs);
    localStorage.setItem('mock_activities', JSON.stringify(updatedActs));

    try {
      await deleteDoc(doc(db, 'activities', id));
    } catch (e) {
      console.warn("Firestore delete intercepted.", e);
    }
  };

  // Goals actions
  const handleAddGoal = async (newGoal: Omit<Goal, 'id' | 'userId' | 'progress' | 'createdAt' | 'status'>) => {
    if (!currentUser) return;

    const goalId = `goal-${Math.random().toString(36).substring(2, 9)}`;
    const goalData: Goal = {
      id: goalId,
      userId: currentUser.uid || 'mock-uid',
      ...newGoal,
      progress: 35, // starting progress
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setGoals([goalData, ...goals]);

    try {
      await setDoc(doc(db, 'goals', goalId), goalData);
    } catch (e) {
      console.warn("Firestore goals write intercepted.", e);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (e) {
      console.warn("Firestore goals delete intercepted.", e);
    }
  };

  const handleUpdateGoalProgress = async (id: string, newProgress: number) => {
    const boundedProgress = Math.min(100, Math.max(0, newProgress));
    
    // Find the goal before update to check if we crossed the 80% boundary
    const oldGoal = goals.find(g => g.id === id);
    if (!oldGoal) return;

    const isCompletedNow = boundedProgress === 100;
    const updatedGoals = goals.map(g => {
      if (g.id === id) {
        return {
          ...g,
          progress: boundedProgress,
          status: isCompletedNow ? ('completed' as const) : g.status
        };
      }
      return g;
    });

    setGoals(updatedGoals);

    // Alert if user is close to meeting their goal (progress >= 80% and old progress was < 80%)
    if (boundedProgress >= 80 && boundedProgress < 100 && oldGoal.progress < 80) {
      addToast(
        "Goal Target Within Reach! 🎯",
        "warning",
        `You are at ${boundedProgress}% for '${oldGoal.title}'. Almost there, keep going!`,
        5000
      );
    } else if (isCompletedNow && oldGoal.progress < 100) {
      addToast(
        "Goal Met successfully! 🎉",
        "success",
        `Congratulations! You fully achieved '${oldGoal.title}' (-${oldGoal.targetReductionPercent}% target reached).`,
        6000
      );
      
      // Reward XP for completion!
      if (userProfile && currentUser) {
        const updatedProfile = {
          ...userProfile,
          totalXp: userProfile.totalXp + 50 // 50 XP bonus for fully completing a goal
        };
        setUserProfile(updatedProfile);
        try {
          await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
        } catch (e) {
          console.warn("Could not sync XP reward:", e);
        }
      }
    }

    try {
      const goalRef = doc(db, 'goals', id);
      await setDoc(goalRef, { 
        progress: boundedProgress,
        status: isCompletedNow ? 'completed' : oldGoal.status 
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore goal update intercepted:", e);
    }
  };

  // Challenges rewards claiming
  const handleCompleteChallenge = async (challengeId: string, xpReward: number, co2Saved: number) => {
    if (!userProfile || !currentUser) return;

    // Update locally
    const updatedChallenges = challenges.map(ch => {
      if (ch.id === challengeId) {
        return {
          ...ch,
          completedBy: [...ch.completedBy, userProfile.id]
        };
      }
      return ch;
    });

    setChallenges(updatedChallenges);

    // Reward XP & update profile with completed challenge reference
    const updatedProfile = {
      ...userProfile,
      totalXp: userProfile.totalXp + xpReward,
      currentStreak: userProfile.currentStreak + 1,
      completedChallenges: [...(userProfile.completedChallenges || []), challengeId]
    };

    setUserProfile(updatedProfile);
    localStorage.setItem('mock_user_session', JSON.stringify({ user: currentUser, role: userRole, profile: updatedProfile }));

    // Trigger notification
    setNotifications([
      `Completed Challenge: ${challenges.find(c => c.id === challengeId)?.title} (+${xpReward} XP)`,
      ...notifications
    ]);

    try {
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
    } catch (e) {
      console.warn("Firestore challenge profile sync blocked.", e);
    }
  };

  // Administrative Custom Factors
  const handleAddEmissionFactor = async (newFactor: Omit<EmissionFactor, 'id'>) => {
    const id = `ef-${Math.random().toString(36).substring(2, 9)}`;
    const factorData: EmissionFactor = { id, ...newFactor };

    const updatedFactors = [...emissionFactors];
    const idx = updatedFactors.findIndex(f => f.category === newFactor.category && f.type === newFactor.type);
    if (idx !== -1) {
      updatedFactors[idx] = factorData;
    } else {
      updatedFactors.push(factorData);
    }
    setEmissionFactors(updatedFactors);

    try {
      await setDoc(doc(db, 'emissionFactors', id), factorData);
    } catch (e) {
      console.warn("Could not save custom emission factor in Firestore:", e);
    }
  };

  const handleDeleteEmissionFactor = async (type: string) => {
    setEmissionFactors(emissionFactors.filter(f => f.type !== type));

    try {
      const snap = await getDocs(query(collection(db, 'emissionFactors'), where('type', '==', type)));
      if (!snap.empty) {
        await deleteDoc(doc(db, 'emissionFactors', snap.docs[0].id));
      }
    } catch (e) {
      console.warn("Could not delete custom emission factor from Firestore:", e);
    }
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleRemoveNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddMockNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev]);
    addToast("Notification Added 🔔", "info", message, 4000);
  };

  // Navigation controller for Tabs
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            userProfile={userProfile} 
            activities={activities} 
            onAddActivity={() => setCurrentTab('log')}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onDeleteActivity={handleDeleteActivity}
          />
        );
      case 'log':
        return (
          <ActivityLogging 
            activities={activities} 
            onAddActivity={handleAddActivity} 
            onDeleteActivity={handleDeleteActivity}
            emissionFactors={emissionFactors}
          />
        );
      case 'map':
        return <InteractiveMap activities={activities} />;
      case 'goals':
        return (
          <GoalsChallenges 
            userProfile={userProfile} 
            goals={goals} 
            challenges={challenges}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onCompleteChallenge={handleCompleteChallenge}
            onUpdateGoalProgress={handleUpdateGoalProgress}
          />
        );
      case 'leaderboard':
        return <Leaderboard userProfile={userProfile} />;
      case 'reports':
        return <Reports activities={activities} />;
      case 'admin':
        return (
          <AdminDashboard 
            emissionFactors={emissionFactors}
            onAddFactor={handleAddEmissionFactor}
            onDeleteFactor={handleDeleteEmissionFactor}
          />
        );
      case 'settings':
        return (
          <Settings 
            userProfile={userProfile} 
            onUpdateProfile={(updated) => setUserProfile(updated)} 
            onLogout={handleLogout} 
          />
        );
      case 'notifications':
        return (
          <NotificationCenter
            notifications={notifications}
            onClearAll={handleClearAllNotifications}
            onRemoveNotification={handleRemoveNotification}
            onAddMockNotification={handleAddMockNotification}
          />
        );
      default:
        return <Dashboard userProfile={userProfile} activities={activities} onAddActivity={() => setCurrentTab('log')} onNavigateToTab={setCurrentTab} />;
    }
  };

  // If on landing or login screen, do not show main sidebar shell
  if (currentTab === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentTab('login')} onSignIn={() => setCurrentTab('login')} />;
  }

  if (currentTab === 'login') {
    return <Login onAuthSuccess={handleAuthSuccess} onBackToLanding={() => setCurrentTab('landing')} />;
  }

  return (
    <div id="app-shell-root" className="min-h-screen bg-[#F9FBFA] text-slate-800 flex font-sans select-none overflow-x-hidden">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside 
        id="app-sidebar"
        className={`bg-white border-r border-emerald-100 flex flex-col justify-between transition-all duration-300 z-40 shrink-0 sticky top-0 h-screen ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-100 bg-white">
            <div className="flex items-center space-x-3.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-150">
                <Leaf className="w-4.5 h-4.5" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-display font-bold text-sm tracking-tight text-slate-800 truncate">
                  Sattva
                </span>
              )}
            </div>
            
            {/* Collapse toggle arrow */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg hidden sm:block border border-slate-50 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation link group */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'Console Hub', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'log', label: 'Log Emissions', icon: <CalendarPlus className="w-4 h-4" /> },
              { id: 'map', label: 'GIS Overlays', icon: <Map className="w-4 h-4" /> },
              { id: 'goals', label: 'Eco Drills', icon: <Target className="w-4 h-4" /> },
              { id: 'leaderboard', label: 'Office Ranks', icon: <Award className="w-4 h-4" /> },
              { id: 'reports', label: 'ESG Audits', icon: <FileSpreadsheet className="w-4 h-4" /> }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-3 transition-colors ${
                  currentTab === item.id 
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}

            {/* Special Administrative role dashboard */}
            {userRole === 'ADMIN' && (
              <div className="pt-3 border-t border-emerald-100">
                {!sidebarCollapsed && <span className="text-[9px] font-mono font-bold text-indigo-400 px-3 block mb-1">AUTHORITY ADMIN</span>}
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center space-x-3 transition-colors ${
                    currentTab === 'admin' 
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-indigo-500" />
                  {!sidebarCollapsed && <span className="truncate">CO₂ Coefficient</span>}
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer User profile info */}
        <div className="p-3 border-t border-emerald-100">
          <button
            onClick={() => setCurrentTab('settings')}
            className="w-full p-2 rounded-xl flex items-center space-x-3 hover:bg-slate-50 text-left border border-transparent hover:border-emerald-100 transition-colors"
          >
            {userProfile?.avatarUrl ? (
              <img 
                src={userProfile.avatarUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border border-emerald-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-xs flex items-center justify-center uppercase">
                {userProfile?.name?.slice(0, 2) || 'SJ'}
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-extrabold text-slate-800 truncate leading-none">{userProfile?.name}</div>
                <span className="text-[9px] text-slate-400 font-mono truncate tracking-tight">{userRole} PANEL</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MAIN HEADER AND WORKSPACE */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#F9FBFA]">
        
        {/* Top Navbar Header */}
        <header id="workspace-header" className="h-16 border-b border-emerald-100 bg-white px-6 flex justify-between items-center shrink-0 z-30 sticky top-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold text-emerald-700 capitalize font-mono tracking-tight bg-emerald-50/50 px-2 py-0.5 rounded border border-emerald-100/50">{currentTab === 'log' ? 'Emissions Ledger' : currentTab === 'map' ? 'GIS Maps' : currentTab}</span>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Notification drop */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-slate-50 rounded-lg relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </button>

              {/* Panel container */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-150 rounded-2xl p-4 shadow-xl shadow-gray-100 z-50 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                    <button 
                      onClick={() => { setCurrentTab('notifications'); setShowNotifications(false); }}
                      className="text-xs font-extrabold text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer text-left flex items-center space-x-1"
                    >
                      <span>Notification Center ↗</span>
                    </button>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAllNotifications}
                        className="text-[9px] text-slate-400 hover:text-rose-600 font-bold uppercase"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-4">No new alerts</p>
                    ) : (
                      notifications.map((notif, index) => (
                        <div 
                          key={index} 
                          onClick={() => { setCurrentTab('notifications'); setShowNotifications(false); }}
                          className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-gray-50 hover:border-emerald-100 text-[10px] text-gray-600 font-medium leading-relaxed cursor-pointer transition-all"
                        >
                          {notif}
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => { setCurrentTab('notifications'); setShowNotifications(false); }}
                    className="w-full text-center mt-2.5 pt-2 border-t border-gray-100 text-[10px] text-emerald-600 hover:text-emerald-700 font-bold block"
                  >
                    View All Notifications →
                  </button>
                </div>
              )}
            </div>

            {/* End session action */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-colors"
              title="Terminate console session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Core Workspace Canvas */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto pb-16">
          {renderTabContent()}
        </main>
      </div>

      {/* Dynamic Toast System Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            const isSuccess = t.type === 'success';
            const isWarning = t.type === 'warning';
            const isError = t.type === 'error';
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`p-4 rounded-2xl shadow-xl flex items-start space-x-3 border ${
                  isSuccess 
                    ? 'bg-emerald-950 text-emerald-100 border-emerald-800' 
                    : isWarning 
                      ? 'bg-amber-950 text-amber-100 border-amber-800' 
                      : isError
                        ? 'bg-red-950 text-red-100 border-red-800'
                        : 'bg-slate-900 text-slate-100 border-slate-800'
                }`}
              >
                {/* Visual Icon Badge */}
                <div className="shrink-0 mt-0.5">
                  {isSuccess && (
                    <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {isWarning && (
                    <div className="w-5 h-5 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      🎯
                    </div>
                  )}
                  {isError && (
                    <div className="w-5 h-5 bg-red-500 rounded-lg flex items-center justify-center text-white">
                      ⚠️
                    </div>
                  )}
                  {t.type === 'info' && (
                    <div className="w-5 h-5 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
                      i
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-xs font-bold leading-tight">{t.message}</div>
                  {t.description && (
                    <div className={`text-[10px] mt-1 leading-relaxed ${
                      isSuccess 
                        ? 'text-emerald-300' 
                        : isWarning 
                          ? 'text-amber-300' 
                          : isError
                            ? 'text-red-300'
                            : 'text-slate-300'
                    }`}>
                      {t.description}
                    </div>
                  )}
                </div>

                {/* Dismiss button */}
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 text-[10px] opacity-60 hover:opacity-100 font-bold uppercase tracking-wider px-1"
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
