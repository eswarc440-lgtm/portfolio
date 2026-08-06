import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

interface NavbarProps {
  onMenuClick: () => void
}

/**
 * Navbar Component
 * Top navigation bar with search, notifications, theme toggle, and profile menu
 */
export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const notifications = [
    {
      id: 1,
      title: 'Bridge Alert',
      message: 'Vibration levels increased on Golden Gate Bridge',
      time: '2 min ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Maintenance Due',
      message: 'Scheduled maintenance for Tower Site 3',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Report Ready',
      message: 'Monthly infrastructure report is ready',
      time: '3 hours ago',
      unread: false,
    },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <nav className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors md:hidden"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Search Bar */}
          <motion.div
            animate={{ width: searchOpen ? 320 : 40 }}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 transition-all"
          >
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            {searchOpen && (
              <input
                autoFocus
                type="text"
                placeholder="Search infrastructure..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                onBlur={() => setSearchOpen(false)}
              />
            )}
            {!searchOpen && (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                ⌘K
              </button>
            )}
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg p-4 space-y-3"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border ${
                      notif.unread
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{notif.time}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDark ? (
              <Sun size={20} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
            </button>

            {/* Profile Menu */}
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User size={16} />
                  Profile
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </Link>

                <button
                  onClick={() => {
                    logout()
                    window.location.href = '/login'
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
