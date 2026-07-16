/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Disaster, 
  Shelter, 
  ResourceItem, 
  ResourceRequest, 
  NGO, 
  Volunteer, 
  Delivery, 
  Notification, 
  ActivityLog,
  SeverityLevel,
  RequestPriority
} from '../types';
import { DisasterDBServ, seedDatabaseIfEmpty } from '../firebase';
import { authService } from '../services/authService';
import { apiService } from '../services/apiService';

interface AppContextType {
  // Navigation & Auth
  currentPath: string;
  path: string;
  setPath: (path: string) => void;
  currentUser: User | null;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  registerUser: (name: string, email: string, password?: string, role?: UserRole, org?: string) => Promise<boolean>;
  updateUserProfile: (updatedData: Partial<User>) => Promise<void>;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Collections State
  disasters: Disaster[];
  shelters: Shelter[];
  resources: ResourceItem[];
  requests: ResourceRequest[];
  ngos: NGO[];
  volunteers: Volunteer[];
  deliveries: Delivery[];
  notifications: Notification[];
  activityLogs: ActivityLog[];

  // Mutators & Workflows
  addDisaster: (item: Omit<Disaster, 'id'>) => Promise<void>;
  updateDisaster: (item: Disaster) => Promise<void>;
  deleteDisaster: (id: string) => Promise<void>;

  addShelter: (item: Omit<Shelter, 'id' | 'occupancy' | 'availableBeds' | 'status'>) => Promise<void>;
  updateShelter: (item: Shelter) => Promise<void>;
  deleteShelter: (id: string) => Promise<void>;

  addResourceRequest: (shelterId: string, items: { item: string; quantity: number }[], priority: RequestPriority) => Promise<void>;
  updateRequestStatus: (requestId: string, status: ResourceRequest['status'], extra?: Partial<ResourceRequest>) => Promise<void>;

  dispatchDelivery: (requestId: string, ngoId: string, volunteerId: string) => Promise<void>;
  updateDeliveryStatus: (deliveryId: string, status: Delivery['status'], note?: string) => Promise<void>;

  registerNGO: (item: Omit<NGO, 'id' | 'activeTasks' | 'completedDeliveries' | 'performanceScore' | 'rating'>) => Promise<void>;
  updateNGO: (item: NGO) => Promise<void>;
  deleteNGO: (id: string) => Promise<void>;
  registerVolunteer: (item: Omit<Volunteer, 'id' | 'completedTasks' | 'rating' | 'coordinates' | 'availability'>) => Promise<void>;
  updateVolunteer: (item: Volunteer) => Promise<void>;
  deleteVolunteer: (id: string) => Promise<void>;

  // Analytics, UI & Smart Advisor
  isLoading: boolean;
  refreshAllData: () => Promise<void>;
  addSystemNotification: (title: string, message: string, type: Notification['type']) => Promise<void>;
  logActivity: (action: string, details: string) => Promise<void>;

  getAIRecommendation: (disaster: Disaster) => Promise<any>;
  getAISimulation: (disaster: Disaster) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const getDashboardPathForRole = (role: UserRole): string => {
  switch (role) {
    case 'Super Admin':
      return '/admin/dashboard';
    case 'Disaster Management Authority':
      return '/authority/dashboard';
    case 'NGO':
      return '/ngo/dashboard';
    case 'Shelter Manager':
      return '/shelter/dashboard';
    case 'Volunteer':
      return '/volunteer/dashboard';
    default:
      return 'dashboard';
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setPath] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Core collections state
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load configuration and seed database on initialization
  useEffect(() => {
    const initialize = async () => {
      try {
        await seedDatabaseIfEmpty();
        await loadAllData();
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };

    initialize();

    // Setup active subscription to Firebase Auth state change centrally
    const unsubscribe = authService.onAuthStateChanged((user, isStillLoading) => {
      if (user) {
        setCurrentUser(user);
        // Only direct to dashboard if on landing/auth/login pages to protect other route navigation
        setPath(prev => (prev === 'landing' || prev === 'auth' || prev === '/login' || prev === '/register' || prev === '/forgot-password') ? getDashboardPathForRole(user.role) : prev);
      } else {
        setCurrentUser(null);
        setPath(prev => {
          const protectedPaths = [
            'dashboard', 
            '/admin/dashboard', 
            '/authority/dashboard', 
            '/ngo/dashboard', 
            '/shelter/dashboard', 
            '/volunteer/dashboard', 
            'settings', 
            'disasters', 
            'shelters', 
            'resources', 
            'requests', 
            'ngos', 
            'volunteers', 
            'deliveries'
          ];
          return protectedPaths.includes(prev) ? '/login' : prev;
        });
      }
      setIsLoading(isStillLoading);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadAllData = async () => {
    try {
      const [dis, sh, res, req, ng, vol, del, not, log] = await Promise.all([
        apiService.disasters.getAll().catch(err => {
          console.warn('Failed to retrieve disasters via REST API:', err);
          return [];
        }),
        apiService.shelters.getAll().catch(err => {
          console.warn('Failed to retrieve shelters via REST API:', err);
          return [];
        }),
        apiService.resources.getAll().catch(err => {
          console.warn('Failed to retrieve resources via REST API:', err);
          return [];
        }),
        apiService.requests.getAll().catch(err => {
          console.warn('Failed to retrieve requests via REST API:', err);
          return [];
        }),
        DisasterDBServ.getNgos().catch(err => {
          console.warn('Failed to retrieve NGOs via database driver:', err);
          return [];
        }),
        DisasterDBServ.getVolunteers().catch(err => {
          console.warn('Failed to retrieve volunteers via database driver:', err);
          return [];
        }),
        DisasterDBServ.getDeliveries().catch(err => {
          console.warn('Failed to retrieve deliveries via database driver:', err);
          return [];
        }),
        DisasterDBServ.getNotifications().catch(err => {
          console.warn('Failed to retrieve notifications via database driver:', err);
          return [];
        }),
        DisasterDBServ.getActivityLogs().catch(err => {
          console.warn('Failed to retrieve activity logs via database driver:', err);
          return [];
        })
      ]);

      setDisasters(dis);
      setShelters(sh);
      setResources(res);
      setRequests(req);
      setNgos(ng);
      setVolunteers(vol);
      setDeliveries(del);
      setNotifications(not);
      setActivityLogs(log);
    } catch (err) {
      console.error('Failed to sync REST API with React state', err);
    }
  };

  const refreshAllData = async () => {
    setIsLoading(true);
    await loadAllData();
    setIsLoading(false);
  };

  // --- AUTHENTICATION ---
  const login = async (email: string, password?: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      let resolvedUser: User;
      const defaultNames: Record<UserRole, string> = {
        'Super Admin': 'System Admin Knox',
        'Disaster Management Authority': 'Director Elizabeth Vance',
        'NGO': 'Sarah Jenkins (NGO Lead)',
        'Shelter Manager': 'Captain Robert Shaw',
        'Volunteer': 'Marcus Vance (Volunteer)',
        'Public User': 'Citizen Emily Mercer'
      };

      if (password) {
        resolvedUser = await authService.login(email, password);
      } else if (role) {
        // Fallback for demo logins (no password provided)
        const name = defaultNames[role] || 'Relief Worker';
        resolvedUser = await authService.loginDemo(email, role, name);
      } else {
        throw new Error('Please specify a password or a role clearance.');
      }

      setCurrentUser(resolvedUser);
      setPath(getDashboardPathForRole(resolvedUser.role));
      
      // Add activity log
      await logActivity('User Login', `Successfully logged in as ${resolvedUser.name} (${resolvedUser.role}).`);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const performLogout = async () => {
      setIsLoading(true);
      try {
        if (currentUser) {
          await logActivity('User Logout', `${currentUser.name} signed out.`);
        }
        await authService.logout();
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        setCurrentUser(null);
        setPath('landing');
        setIsLoading(false);
      }
    };
    performLogout();
  };

  const registerUser = async (
    name: string,
    email: string,
    password?: string,
    role?: UserRole,
    org?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const actualPassword = password || 'DemoPassword123!';
      const actualRole = role || 'Public User';
      
      const resolvedUser = await authService.register(
        name,
        email,
        actualPassword,
        actualRole,
        org
      );

      // Do not auto-sign in upon registration, as per user's production SaaS requirement:
      // "After successful registration: Show success animation, Display message: "Your registration has been submitted successfully.", Redirect user to Login page."
      await authService.logout();
      setCurrentUser(null);

      await logActivity('User Registration', `Registered new profile: ${name} as ${actualRole}.`);
      await addSystemNotification('Welcome Onboard!', `Your credentials as a ${actualRole} are now active.`, 'success');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) throw new Error('No user is currently signed in.');
    try {
      const updatedUser: User = {
        ...currentUser,
        ...updatedData
      };
      await authService.saveUserProfile(updatedUser);
      setCurrentUser(updatedUser);
      await logActivity('Profile Updated', `Successfully updated profile parameters for ${updatedUser.name}.`);
      await addSystemNotification('Profile Updated', 'Your profile details have been synchronized with the database.', 'success');
    } catch (error: any) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- DISASTER WORKFLOWS ---
  const addDisaster = async (item: Omit<Disaster, 'id'>) => {
    try {
      const created = await apiService.disasters.create(item);
      setDisasters(prev => [...prev, created]);
      await logActivity('Disaster Declared', `Declared new ${created.type} in ${created.location}.`);
      await addSystemNotification(`NEW DISASTER: ${created.type}`, `${created.title} declared with ${created.severity} severity.`, 'emergency');
    } catch (error: any) {
      console.error('Failed to declare disaster:', error);
      await addSystemNotification('Declaration Failed', `Disaster declaration failed: ${error.message}`, 'warning');
      throw error;
    }
  };

  const updateDisaster = async (item: Disaster) => {
    try {
      const updated = await apiService.disasters.update(item);
      setDisasters(prev => prev.map(x => x.id === item.id ? updated : x));
      await logActivity('Disaster Status Updated', `Updated report details for disaster ID: ${item.id}.`);
    } catch (error: any) {
      console.error('Failed to update disaster:', error);
      await addSystemNotification('Update Failed', `Disaster update failed: ${error.message}`, 'warning');
      throw error;
    }
  };

  const deleteDisaster = async (id: string) => {
    try {
      await apiService.disasters.delete(id);
      setDisasters(prev => prev.filter(x => x.id !== id));
      await logActivity('Disaster Record Deleted', `Removed disaster registry reference for ID: ${id}.`);
    } catch (error: any) {
      console.error('Failed to delete disaster:', error);
      await addSystemNotification('Deletion Failed', `Disaster deletion failed: ${error.message}`, 'warning');
      throw error;
    }
  };

  // --- SHELTER WORKFLOWS ---
  const addShelter = async (item: Omit<Shelter, 'id' | 'occupancy' | 'availableBeds' | 'status'>) => {
    try {
      const created = await apiService.shelters.create(item);
      setShelters(prev => [...prev, created]);
      await logActivity('Shelter Registered', `Registered new humanitarian shelter site: ${created.name}.`);
      await addSystemNotification('New Shelter Online', `Shelter site ${created.name} is now open with capacity ${created.capacity}.`, 'success');
    } catch (error: any) {
      console.error('Failed to register shelter:', error);
      await addSystemNotification('Registration Failed', `Shelter registration failed: ${error.message}`, 'warning');
      throw error;
    }
  };

  const updateShelter = async (item: Shelter) => {
    try {
      const updated = await apiService.shelters.update(item);
      setShelters(prev => prev.map(x => x.id === item.id ? updated : x));
      await logActivity('Shelter Logistics Updated', `Updated logistics parameters for shelter: ${item.name}.`);
    } catch (error: any) {
      console.error('Failed to update shelter:', error);
      await addSystemNotification('Update Failed', `Shelter update failed: ${error.message}`, 'warning');
      throw error;
    }
  };

  const deleteShelter = async (id: string) => {
    try {
      await apiService.shelters.delete(id);
      setShelters(prev => prev.filter(x => x.id !== id));
      await logActivity('Shelter Site Retired', `Retired shelter registry ID: ${id}.`);
    } catch (error: any) {
      console.error('Failed to retire shelter:', error);
      await addSystemNotification('Retirement Failed', `Shelter retirement failed: ${error.message}`, 'warning');
      throw error;
    }
  };

  // --- RESOURCE REQUESTS WORKFLOW ---
  const addResourceRequest = async (shelterId: string, items: { item: string; quantity: number }[], priority: RequestPriority) => {
    const shelter = shelters.find(s => s.id === shelterId);
    const newRequest: ResourceRequest = {
      id: `req-${Date.now()}`,
      shelterId,
      shelterName: shelter ? shelter.name : 'Unknown Shelter',
      items,
      priority,
      status: 'Pending',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const created = await apiService.requests.create(newRequest);
    setRequests(prev => [...prev, created]);
    await logActivity('Resource Request Filed', `Shelter ${newRequest.shelterName} requested ${items.length} supply categories with ${priority} priority.`);
    await addSystemNotification(`Supply Need: ${priority}`, `${newRequest.shelterName} submitted a critical request for resources.`, priority === 'Critical' ? 'emergency' : 'warning');
  };

  const updateRequestStatus = async (requestId: string, status: ResourceRequest['status'], extra?: Partial<ResourceRequest>) => {
    const current = requests.find(r => r.id === requestId);
    if (!current) return;

    const updated: ResourceRequest = {
      ...current,
      status,
      ...extra
    };

    const saved = await apiService.requests.update(updated);
    setRequests(prev => prev.map(x => x.id === requestId ? saved : x));

    // Dedicate resources if approved or delivered
    if (status === 'Approved') {
      // Deduct or reserve stocks
      for (const reqItem of updated.items) {
        const matchingRes = resources.find(r => r.name === reqItem.item);
        if (matchingRes) {
          const newRes = {
            ...matchingRes,
            stock: Math.max(0, matchingRes.stock - reqItem.quantity),
            reserved: matchingRes.reserved + reqItem.quantity
          };
          await apiService.resources.update(newRes);
          setResources(prev => prev.map(x => x.id === matchingRes.id ? newRes : x));
        }
      }
    } else if (status === 'Completed') {
      // Move reserved stocks to delivered
      for (const reqItem of updated.items) {
        const matchingRes = resources.find(r => r.name === reqItem.item);
        if (matchingRes) {
          const newRes = {
            ...matchingRes,
            reserved: Math.max(0, matchingRes.reserved - reqItem.quantity),
            delivered: matchingRes.delivered + reqItem.quantity
          };
          await apiService.resources.update(newRes);
          setResources(prev => prev.map(x => x.id === matchingRes.id ? newRes : x));
        }
      }
    }

    await logActivity('Request Stage Advanced', `Advanced Request ${requestId} status to: ${status}.`);
    await addSystemNotification('Request Status Advanced', `Supply Request #${requestId} is now in status [${status}].`, 'info');
  };

  // --- DELIVERY OPERATIONS ---
  const dispatchDelivery = async (requestId: string, ngoId: string, volunteerId: string) => {
    const request = requests.find(r => r.id === requestId);
    const ngo = ngos.find(n => n.id === ngoId);
    const volunteer = volunteers.find(v => v.id === volunteerId);

    if (!request || !ngo || !volunteer) return;

    const newDelivery: Delivery = {
      id: `del-${Date.now()}`,
      requestId,
      shelterId: request.shelterId,
      shelterName: request.shelterName,
      ngoId,
      ngoName: ngo.name,
      volunteerId,
      volunteerName: volunteer.name,
      vehicle: `${volunteer.vehicle} (${volunteer.vehicleNo})`,
      status: 'Dispatched',
      estimatedArrival: '35 mins',
      timeline: [
        { status: 'Cargo Dispatched', timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16), note: `Supplies loaded and dispatched via ${volunteer.name}.` }
      ]
    };

    // Update Request status to Assigned/In Transit
    await updateRequestStatus(requestId, 'Assigned', {
      assignedNgoId: ngoId,
      assignedNgoName: ngo.name,
      assignedVolunteerId: volunteerId,
      assignedVolunteerName: volunteer.name
    });

    // Set volunteer to Busy
    const updatedVol: Volunteer = { ...volunteer, availability: 'Busy' };
    await DisasterDBServ.updateVolunteer(updatedVol);
    setVolunteers(prev => prev.map(x => x.id === volunteerId ? updatedVol : x));

    // Register active delivery
    await DisasterDBServ.updateDelivery(newDelivery);
    setDeliveries(prev => [...prev, newDelivery]);

    await logActivity('Cargo Transferred', `Supply dispatch initialized for Request #${requestId} via ${volunteer.name} (${ngo.name}).`);
    await addSystemNotification('Delivery In Route', `Cargo convoy dispatched to ${request.shelterName}. Est: 35m.`, 'success');
  };

  const updateDeliveryStatus = async (deliveryId: string, status: Delivery['status'], note?: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    const updatedTimeline = [
      ...delivery.timeline,
      {
        status,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        note: note || `Confronted with waypoint update: ${status}`
      }
    ];

    const updated: Delivery = {
      ...delivery,
      status,
      timeline: updatedTimeline,
      estimatedArrival: status === 'Delivered' ? '--' : delivery.estimatedArrival
    };

    // Update in Db
    await DisasterDBServ.updateDelivery(updated);
    setDeliveries(prev => prev.map(x => x.id === deliveryId ? updated : x));

    // Handle completed statuses
    if (status === 'Delivered') {
      // Advanced corresponding request to 'Completed'
      await updateRequestStatus(delivery.requestId, 'Completed');

      // Release volunteer
      if (delivery.volunteerId) {
        const vol = volunteers.find(v => v.id === delivery.volunteerId);
        if (vol) {
          const updatedVol: Volunteer = { 
            ...vol, 
            availability: 'Available',
            completedTasks: vol.completedTasks + 1
          };
          await DisasterDBServ.updateVolunteer(updatedVol);
          setVolunteers(prev => prev.map(x => x.id === vol.id ? updatedVol : x));
        }
      }

      // Add to NGO statistics
      if (delivery.ngoId) {
        const ngoItem = ngos.find(n => n.id === delivery.ngoId);
        if (ngoItem) {
          const updatedNgo: NGO = {
            ...ngoItem,
            completedDeliveries: ngoItem.completedDeliveries + 1,
            activeTasks: Math.max(0, ngoItem.activeTasks - 1),
            performanceScore: Math.min(100, ngoItem.performanceScore + 1)
          };
          await DisasterDBServ.updateNgo(updatedNgo);
          setNgos(prev => prev.map(x => x.id === ngoItem.id ? updatedNgo : x));
        }
      }
    } else if (status === 'In Transit') {
      await updateRequestStatus(delivery.requestId, 'In Transit');
    }

    await logActivity('Delivery Status Logged', `Delivery #${deliveryId} marked as [${status}].`);
  };

  // --- NGO & VOLUNTEER REGISTRATIONS ---
  const registerNGO = async (item: Omit<NGO, 'id' | 'activeTasks' | 'completedDeliveries' | 'performanceScore' | 'rating'>) => {
    const newNgo: NGO = {
      ...item,
      id: `ngo-${Date.now()}`,
      activeTasks: 0,
      completedDeliveries: 0,
      performanceScore: 100,
      rating: 5.0
    };
    await DisasterDBServ.updateNgo(newNgo);
    setNgos(prev => [...prev, newNgo]);
    await logActivity('NGO Registered', `Registered new strategic responder NGO: ${item.name}.`);
    await addSystemNotification('NGO Strategic Partner Online', `NGO ${item.name} is now approved for operations.`, 'success');
  };

  const updateNGO = async (item: NGO) => {
    await DisasterDBServ.updateNgo(item);
    setNgos(prev => prev.map(x => x.id === item.id ? item : x));
    await logActivity('NGO Profile Updated', `Updated registration details and clearance parameters for NGO: ${item.name}.`);
  };

  const deleteNGO = async (id: string) => {
    await DisasterDBServ.deleteNgo(id);
    setNgos(prev => prev.filter(x => x.id !== id));
    await logActivity('NGO Partner Retired', `Removed NGO alliance partner registry: ID ${id}.`);
  };

  const registerVolunteer = async (item: Omit<Volunteer, 'id' | 'completedTasks' | 'rating' | 'availability'> & { coordinates?: { x: number; y: number } }) => {
    const newVol: Volunteer = {
      ...item,
      id: `vol-${Date.now()}`,
      completedTasks: 0,
      rating: 5.0,
      coordinates: item.coordinates || { x: 50 + (Math.random() - 0.5) * 30, y: 50 + (Math.random() - 0.5) * 30 },
      availability: 'Available'
    };
    await DisasterDBServ.updateVolunteer(newVol);
    setVolunteers(prev => [...prev, newVol]);
    await logActivity('Volunteer Activated', `Enrolled mobile responder: ${item.name}.`);
    await addSystemNotification('Mobile Responder Activated', `Responder ${item.name} is registered and available.`, 'success');
  };

  const updateVolunteer = async (item: Volunteer) => {
    await DisasterDBServ.updateVolunteer(item);
    setVolunteers(prev => prev.map(x => x.id === item.id ? item : x));
    await logActivity('Volunteer Profile Updated', `Updated record details for mobile responder: ${item.name}.`);
  };

  const deleteVolunteer = async (id: string) => {
    await DisasterDBServ.deleteVolunteer(id);
    setVolunteers(prev => prev.filter(x => x.id !== id));
    await logActivity('Volunteer Dismissed', `De-registered and retired mobile responder reference: ID ${id}.`);
  };

  // --- SYSTEM LOGS & NOTIFICATIONS ---
  const addSystemNotification = async (title: string, message: string, type: Notification['type']) => {
    const notif: Notification = {
      id: `not-${Date.now()}`,
      title,
      message,
      type,
      time: 'Just now',
      read: false
    };
    await DisasterDBServ.addNotification(notif);
    setNotifications(prev => [notif, ...prev]);
  };

  const logActivity = async (action: string, details: string) => {
    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: currentUser ? currentUser.id : 'system',
      userName: currentUser ? currentUser.name : 'Emergency Management Daemon',
      role: currentUser ? currentUser.role : 'System Admin',
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    await DisasterDBServ.addActivityLog(log);
    setActivityLogs(prev => [log, ...prev]);
  };

  // --- AI ADVISORY & SIMULATION ENDPOINTS ---
  const getAIRecommendation = async (disaster: Disaster) => {
    try {
      const response = await fetch('/api/gemini/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: disaster.type,
          severity: disaster.severity,
          location: disaster.location,
          affected: disaster.affected,
          description: disaster.description
        })
      });
      return await response.json();
    } catch (err) {
      console.error('AI Advisory request failed', err);
      return null;
    }
  };

  const getAISimulation = async (disaster: Disaster) => {
    try {
      const response = await fetch('/api/gemini/simulate-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: disaster.type,
          severity: disaster.severity,
          location: disaster.location,
          description: disaster.description
        })
      });
      return await response.json();
    } catch (err) {
      console.error('AI simulation request failed', err);
      return null;
    }
  };

  return (
    <AppContext.Provider value={{
      currentPath,
      path: currentPath,
      setPath,
      currentUser,
      login,
      logout,
      registerUser,
      updateUserProfile,

      theme,
      toggleTheme,

      disasters,
      shelters,
      resources,
      requests,
      ngos,
      volunteers,
      deliveries,
      notifications,
      activityLogs,

      addDisaster,
      updateDisaster,
      deleteDisaster,

      addShelter,
      updateShelter,
      deleteShelter,

      addResourceRequest,
      updateRequestStatus,

      dispatchDelivery,
      updateDeliveryStatus,

      registerNGO,
      updateNGO,
      deleteNGO,
      registerVolunteer,
      updateVolunteer,
      deleteVolunteer,

      isLoading,
      refreshAllData,
      addSystemNotification,
      logActivity,

      getAIRecommendation,
      getAISimulation
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppProvider');
  return context;
};
