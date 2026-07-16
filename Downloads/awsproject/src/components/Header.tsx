/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  ChevronDown, 
  Settings, 
  HelpCircle,
  Clock,
  Briefcase,
  Layers,
  MapPin,
  Moon,
  Sun
} from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const { 
    currentPath, 
    setPath, 
    currentUser, 
    login, 
    notifications, 
    disasters,
    refreshAllData,
    isLoading,
    theme,
    toggleTheme
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.avatar]);

  // Do not render header on landing, auth, login, register, or forgot password screens
  const hideHeaderPaths = ['landing', 'auth', '/login', '/register', '/forgot-password'];
  if (hideHeaderPaths.includes(currentPath)) return null;

  const activeNotifications = notifications.filter(n => !n.read);

  const getBreadcrumb = () => {
    switch (currentPath) {
      case 'dashboard': return 'Logistics Control Center';
      case 'disasters': return 'Disaster Operations';
      case 'shelters': return 'Evacuation Shelters Registry';
      case 'resources': return 'Logistics Warehouses & Stocks';
      case 'requests': return 'Emergency Resource Requisitions';
      case 'ngos': return 'NGO Strategic Alliances';
      case 'volunteers': return 'Volunteer Dispatch Network';
      case 'deliveries': return 'Real-time Supply Chain Tracking';
      case 'settings': return 'System Permissions Configuration';
      default: return 'Overview';
    }
  };

  const handleRoleChange = async (role: UserRole) => {
    setProfileOpen(false);
    await login('demo@reliefsystem.org', role);
    setPath('dashboard');
  };

  const rolesList: UserRole[] = [
    'Super Admin',
    'Disaster Management Authority',
    'NGO',
    'Shelter Manager',
    'Volunteer',
    'Public User'
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 h-16 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center text-xs font-mono text-slate-400">
          <span>CONSOLE</span>
          <span className="mx-2">/</span>
          <span className="text-slate-950 font-sans font-semibold tracking-tight">
            {getBreadcrumb()}
          </span>
        </div>
        {isLoading && (
          <span className="inline-flex h-2 w-2 rounded-full bg-rose-500 animate-ping ml-2"></span>
        )}
      </div>

      {/* Global Utilities */}
      <div className="flex items-center space-x-5">
        {/* Quick Role Switcher Showcase badge */}
        {currentUser && (
          <div className="relative group">
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="inline-flex items-center space-x-2 px-2.5 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100/80 rounded-md transition-colors text-xs font-medium text-rose-700 cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Role: {currentUser.role}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-40 animate-in fade-in-50 duration-100">
                <div className="px-3 py-1 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block">
                    Quick Simulation Role
                  </span>
                </div>
                {rolesList.map(r => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 flex items-center justify-between transition-colors ${currentUser.role === r ? 'text-rose-600 bg-rose-50/50' : 'text-slate-600'}`}
                  >
                    <span>{r}</span>
                    {currentUser.role === r && <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Input bar */}
        <div className="relative hidden md:block w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input 
            type="text" 
            placeholder="Search assets, requests, vectors..."
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-150/70 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 border border-transparent focus:border-slate-300 dark:focus:border-slate-600 rounded-lg py-1.5 pl-9 pr-3 transition-all focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600"
          />
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
          }}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          type="button"
        >
          {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications Icon with Indicator */}
        <div className="relative">
          <button 
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors focus:outline-none relative"
          >
            <Bell className="h-4.5 w-4.5" />
            {activeNotifications.length > 0 && (
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-40 overflow-hidden animate-in fade-in-50 duration-150">
              <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-600 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-1.5">
                  <span>Emergency Alert Center</span>
                  {activeNotifications.length > 0 && (
                    <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {activeNotifications.length} Active
                    </span>
                  )}
                </h3>
                <button 
                  onClick={() => refreshAllData()}
                  className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium font-sans"
                >
                  Refresh Data
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    No notifications reported in local sector.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-3 hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-rose-50/15 dark:bg-rose-900/10' : ''}`}>
                      <div className="flex items-start justify-between">
                        <span className={`text-[10px] font-bold uppercase ${n.type === 'emergency' ? 'text-rose-600' : n.type === 'warning' ? 'text-amber-600' : n.type === 'success' ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {n.type}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono flex items-center space-x-1">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{n.time}</span>
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">{n.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-600 text-center">
                <button 
                  onClick={() => { setNotifOpen(false); setPath('dashboard'); }}
                  className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 transition-colors"
                >
                  View Active Operations Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Quick Indicator */}
        {currentUser && (() => {
          const getAvatarStyles = (role: string) => {
            switch (role) {
              case 'Super Admin':
                return 'bg-rose-100 text-rose-700 border-rose-200';
              case 'Disaster Management Authority':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
              case 'NGO':
                return 'bg-purple-100 text-purple-700 border-purple-200';
              case 'Shelter Manager':
                return 'bg-teal-100 text-teal-700 border-teal-200';
              case 'Volunteer':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
              default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
            }
          };

          const getInitials = (name: string) => {
            if (!name) return 'U';
            const parts = name.trim().split(/\s+/);
            if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
          };

          const hasImage = currentUser.avatar && !avatarError;

          return (
            <div className="flex items-center space-x-2.5 border-l border-slate-200 pl-4">
              {hasImage ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full border border-slate-200 object-cover shadow-sm"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono tracking-tight shadow-sm ${getAvatarStyles(currentUser.role)}`}>
                  {getInitials(currentUser.name)}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <h4 className="text-xs font-semibold text-slate-800 tracking-tight leading-none mb-1">
                  {currentUser.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-mono leading-none">
                  {currentUser.organization || currentUser.role}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </header>
  );
};
