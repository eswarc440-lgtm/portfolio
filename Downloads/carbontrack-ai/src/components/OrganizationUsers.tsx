import React, { useState, useMemo } from 'react';
import {
  Users, Plus, Search, Mail, Trash2, Edit, Shield, Check, X,
  Clock, Award, TrendingUp, Send, UserPlus, Filter
} from 'lucide-react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface OrgUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'contributor' | 'viewer';
  status: 'active' | 'invited' | 'inactive';
  joinDate: string;
  carbonScore: number;
  totalXp: number;
  activities: number;
}

interface OrganizationUsersProps {
  currentUser: UserProfile | null;
  onUserAction?: (action: 'invite' | 'remove' | 'updateRole', userId: string, data?: any) => void;
}

export default function OrganizationUsers({ currentUser, onUserAction }: OrganizationUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'manager' | 'contributor' | 'viewer'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'invited' | 'inactive'>('all');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'contributor' | 'manager'>('contributor');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'manager' | 'contributor' | 'viewer'>('contributor');

  // Mock org users
  const mockUsers: OrgUser[] = [
    {
      id: 'u1',
      email: 'admin@carbontrack.org',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      joinDate: '2026-01-15',
      carbonScore: 92,
      totalXp: 4500,
      activities: 250
    },
    {
      id: 'u2',
      email: 'manager@carbontrack.org',
      name: 'Team Manager',
      role: 'manager',
      status: 'active',
      joinDate: '2026-02-20',
      carbonScore: 85,
      totalXp: 3200,
      activities: 180
    },
    {
      id: 'u3',
      email: 'contributor@carbontrack.org',
      name: 'Active Contributor',
      role: 'contributor',
      status: 'active',
      joinDate: '2026-03-10',
      carbonScore: 78,
      totalXp: 2100,
      activities: 120
    },
    {
      id: 'u4',
      email: 'newuser@carbontrack.org',
      name: 'New Team Member',
      role: 'contributor',
      status: 'invited',
      joinDate: '2026-07-28',
      carbonScore: 0,
      totalXp: 0,
      activities: 0
    },
    {
      id: 'u5',
      email: 'inactive@carbontrack.org',
      name: 'Inactive User',
      role: 'viewer',
      status: 'inactive',
      joinDate: '2025-12-01',
      carbonScore: 45,
      totalXp: 800,
      activities: 30
    }
  ];

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchQuery, selectedRole, selectedStatus]);

  // User statistics
  const stats = useMemo(() => {
    return {
      total: mockUsers.length,
      active: mockUsers.filter(u => u.status === 'active').length,
      invited: mockUsers.filter(u => u.status === 'invited').length,
      avgCarbonScore: Math.round(mockUsers.reduce((sum, u) => sum + u.carbonScore, 0) / mockUsers.length),
      avgXp: Math.round(mockUsers.reduce((sum, u) => sum + u.totalXp, 0) / mockUsers.length)
    };
  }, []);

  const handleInvite = () => {
    if (inviteEmail && onUserAction) {
      onUserAction('invite', 'new', { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setShowInviteForm(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (onUserAction) {
      onUserAction('remove', userId);
    }
  };

  const handleUpdateRole = (userId: string) => {
    if (onUserAction) {
      onUserAction('updateRole', userId, { role: editRole });
      setEditingUser(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'manager': return '💼';
      case 'contributor': return '🌱';
      case 'viewer': return '👁️';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-50 text-red-700 border-red-200';
      case 'manager': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contributor': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'viewer': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'invited': return 'bg-amber-100 text-amber-800';
      case 'inactive': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 font-display">Organization Users</h1>
          <p className="text-sm text-slate-500">Manage team members, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowInviteForm(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm"
        >
          <div className="text-[10px] font-bold text-slate-600 uppercase">Total Users</div>
          <div className="text-3xl font-extrabold text-slate-800 mt-2">{stats.total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-emerald-200 rounded-lg p-4 shadow-sm"
        >
          <div className="text-[10px] font-bold text-emerald-700 uppercase">Active</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.active}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm"
        >
          <div className="text-[10px] font-bold text-amber-700 uppercase">Invited</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{stats.invited}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm"
        >
          <div className="text-[10px] font-bold text-blue-700 uppercase">Avg Score</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">{stats.avgCarbonScore}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm"
        >
          <div className="text-[10px] font-bold text-purple-700 uppercase">Avg XP</div>
          <div className="text-3xl font-extrabold text-purple-600 mt-2">{(stats.avgXp / 100).toFixed(0)}k</div>
        </motion.div>
      </div>

      {/* Invite Form */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-emerald-900">Invite New Team Member</h3>
              <button
                onClick={() => setShowInviteForm(false)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-900 mb-1">Initial Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg text-sm bg-white"
                >
                  <option value="contributor">Contributor (can log activities)</option>
                  <option value="manager">Manager (can manage team)</option>
                </select>
              </div>
              <div className="flex space-x-2 justify-end pt-2">
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 border border-emerald-300 text-emerald-700 text-sm font-bold rounded-lg hover:bg-emerald-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg flex items-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Invite</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as any)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="contributor">Contributor</option>
          <option value="viewer">Viewer</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Carbon Score</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">XP</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Activities</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getRoleColor(user.role)}`}>
                      <span>{getRoleIcon(user.role)}</span>
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-slate-900">{user.carbonScore}</span>
                      {user.carbonScore > 80 && <Award className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{user.totalXp}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{user.activities}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {editingUser === user.id ? (
                        <div className="flex items-center space-x-1">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as any)}
                            className="px-2 py-1 border border-slate-200 rounded text-xs bg-white"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="contributor">Contributor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(user.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(user.id);
                              setEditRole(user.role);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No users found matching your filters</p>
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Role Permissions</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-900">👑 Admin</span>
            <p className="text-slate-600 mt-1">Full system access, manage users and settings</p>
          </div>
          <div>
            <span className="font-bold text-slate-900">💼 Manager</span>
            <p className="text-slate-600 mt-1">Manage team, view analytics, set budgets</p>
          </div>
          <div>
            <span className="font-bold text-slate-900">🌱 Contributor</span>
            <p className="text-slate-600 mt-1">Log activities, view personal dashboard</p>
          </div>
          <div>
            <span className="font-bold text-slate-900">👁️ Viewer</span>
            <p className="text-slate-600 mt-1">View-only access to team reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}
