/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Server, 
  Package, 
  GitPullRequest, 
  ShieldAlert, 
  Users, 
  Hammer, 
  Truck, 
  Settings, 
  Cpu,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentPath, setPath, currentUser, logout } = useApp();

  // If we are on landing, auth, login, register, or forgot password pages, do not render sidebar
  const hideSidebarPaths = ['landing', 'auth', '/login', '/register', '/forgot-password'];
  if (hideSidebarPaths.includes(currentPath)) return null;

  const menuItems = [
    { path: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, roles: ['all'] },
    { path: 'disasters', label: 'Active Disasters', icon: AlertTriangle, roles: ['all'] },
    { path: 'shelters', label: 'Emergency Shelters', icon: Server, roles: ['all'] },
    { path: 'resources', label: 'Supplies & Warehouse', icon: Package, roles: ['Super Admin', 'Disaster Management Authority', 'NGO', 'Shelter Manager'] },
    { path: 'requests', label: 'Resource Requests', icon: GitPullRequest, roles: ['Super Admin', 'Disaster Management Authority', 'NGO', 'Shelter Manager'] },
    { path: 'ngos', label: 'NGO Partners', icon: Users, roles: ['Super Admin', 'Disaster Management Authority', 'NGO'] },
    { path: 'volunteers', label: 'Volunteer Teams', icon: Hammer, roles: ['Super Admin', 'Disaster Management Authority', 'NGO', 'Volunteer'] },
    { path: 'deliveries', label: 'Delivery Tracking', icon: Truck, roles: ['all'] },
    { path: 'settings', label: 'System Settings', icon: Settings, roles: ['Super Admin', 'Disaster Management Authority'] },
  ];

  const filteredItems = menuItems.filter(item => {
    if (item.roles.includes('all')) return true;
    return currentUser && item.roles.includes(currentUser.role);
  });

  return (
    <aside 
      className={`bg-slate-50 border-r border-slate-200 h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 z-30 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Upper Logo Section */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="p-1.5 bg-rose-600 text-white rounded-md flex-shrink-0 animate-pulse">
              <ShieldAlert className="h-5 w-5" />
            </div>
            {!collapsed && (
              <span className="font-sans font-bold text-xs tracking-tight text-slate-900 uppercase">
                Smart Relief
              </span>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none hidden md:block"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path === 'dashboard' && (
              currentPath === '/admin/dashboard' || 
              currentPath === '/authority/dashboard' || 
              currentPath === '/ngo/dashboard' || 
              currentPath === '/shelter/dashboard' || 
              currentPath === '/volunteer/dashboard'
            ));
            return (
              <button
                key={item.path}
                onClick={() => setPath(item.path)}
                className={`w-full flex items-center space-x-3 p-2.5 rounded-lg text-left text-xs font-medium transition-all group ${
                  isActive 
                    ? 'bg-rose-50 text-rose-700 shadow-sm border-l-2 border-rose-600' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`h-4.5 w-4.5 flex-shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-rose-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Section */}
      <div className="p-3 border-t border-slate-200">
        {!collapsed && currentUser && (
          <div className="mb-3 px-2 py-1.5 bg-slate-100/70 rounded-lg flex items-center space-x-2.5">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="h-8 w-8 rounded-full border border-slate-300 object-cover"
            />
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-slate-800 truncate">{currentUser.name}</h4>
              <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`w-full flex items-center space-x-3 p-2.5 rounded-lg text-left text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4.5 w-4.5 text-slate-500 hover:text-rose-600" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
