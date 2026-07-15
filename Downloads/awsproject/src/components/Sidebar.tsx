/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  LogOut,
  User as UserIcon,
  Upload,
  X,
  Check,
  Phone,
  Building,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentPath, setPath, currentUser, logout, updateUserProfile } = useApp();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileOrg, setProfileOrg] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfilePhone(currentUser.phone || '');
      setProfileOrg(currentUser.organization || '');
      setProfileAvatar(currentUser.avatar || '');
    }
  }, [currentUser]);

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.avatar, profileAvatar]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError('Image size exceeds the 2MB limit. Please select a smaller image.');
      return;
    }
    
    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileAvatar(event.target.result as string);
      }
    };
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setError('Display Name is a required field.');
      return;
    }
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      await updateUserProfile({
        name: profileName,
        phone: profilePhone,
        organization: profileOrg,
        avatar: profileAvatar
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsEditProfileOpen(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update credentials.');
    } finally {
      setSaving(false);
    }
  };

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
        {!collapsed && currentUser && (() => {
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
            <div className="mb-3 px-2 py-1.5 bg-slate-100/70 rounded-lg flex items-center space-x-2.5">
              {hasImage ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full border border-slate-200 object-cover shadow-sm flex-shrink-0"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono tracking-tight shadow-sm flex-shrink-0 ${getAvatarStyles(currentUser.role)}`}>
                  {getInitials(currentUser.name)}
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-slate-800 truncate">{currentUser.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.role}</p>
              </div>
            </div>
          );
        })()}

        {/* Edit Profile Option */}
        <button
          onClick={() => {
            setError('');
            setSuccess(false);
            setIsEditProfileOpen(true);
          }}
          className={`w-full flex items-center space-x-3 p-2.5 mb-1 rounded-lg text-left text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? "Edit Profile" : undefined}
        >
          <UserIcon className="h-4.5 w-4.5 text-slate-500 hover:text-slate-800" />
          {!collapsed && <span>Edit Profile</span>}
        </button>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className={`w-full flex items-center space-x-3 p-2.5 rounded-lg text-left text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4.5 w-4.5 text-slate-500 hover:text-rose-600" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-rose-600 rounded-lg">
                    <UserIcon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono tracking-wider uppercase">Edit Profile Credentials</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Update your personal profile credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-5">
                {success && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in duration-200">
                    <Check className="h-4 w-4" />
                    <span>Profile updated successfully. Your credentials are synchronized.</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Avatar Preview & Upload Area */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">
                    Profile Picture / Avatar
                  </label>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    {/* Live Preview Circle */}
                    <div className="relative group flex-shrink-0">
                      <div className="h-20 w-20 rounded-full border-2 border-rose-500 bg-white shadow-md overflow-hidden flex items-center justify-center">
                        {profileAvatar && !avatarError ? (
                          <img
                            src={profileAvatar}
                            alt="Avatar Preview"
                            className="h-full w-full object-cover"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <div className="text-2xl font-black font-mono text-slate-400 uppercase">
                            {profileName ? profileName.substring(0, 2) : 'U'}
                          </div>
                        )}
                      </div>
                      {profileAvatar && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfileAvatar('');
                            setAvatarError(false);
                          }}
                          className="absolute -top-1 -right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg border border-white cursor-pointer transition-transform hover:scale-110"
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Uploader Drag-and-Drop / Browse */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`flex-1 w-full border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                        dragActive
                          ? 'border-rose-500 bg-rose-50/50'
                          : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <Upload className="h-5 w-5 mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-semibold text-slate-700">
                        {dragActive ? 'Drop your image here' : 'Click to upload or drag & drop'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                        Supports PNG, JPG or WEBP (Max 2MB)
                      </p>
                    </div>
                  </div>

                  {/* Image URL Input as alternate */}
                  <div>
                    <label className="block text-[9px] text-slate-400 font-mono uppercase mb-1">
                      Or paste an external image URL
                    </label>
                    <input
                      type="url"
                      value={profileAvatar.startsWith('data:') ? '' : profileAvatar}
                      onChange={(e) => {
                        setProfileAvatar(e.target.value);
                        setAvatarError(false);
                      }}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 bg-white text-slate-800 font-sans"
                    />
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white text-slate-800 font-sans"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1.5">Email (Locked)</label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1.5">Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="e.g. +1 555-019-2834"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white text-slate-800 font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider mb-1.5">Organization / Agency</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileOrg}
                        onChange={(e) => setProfileOrg(e.target.value)}
                        placeholder="e.g. Red Cross Florida"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white text-slate-800 font-sans"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  Role: <span className="font-bold text-rose-600">{currentUser?.role}</span>
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    {saving ? (
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>Save Credentials</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
};
