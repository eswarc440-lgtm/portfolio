import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  MapPin,
  AlertTriangle,
  Settings,
  Users,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

/**
 * Sidebar Component
 * Navigation sidebar with collapsible menu items
 */
export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const isActive = (path: string) => location.pathname === path

  const toggleExpand = (item: string) => {
    setExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      badge: null,
    },
    {
      label: 'Infrastructure',
      icon: Zap,
      submenu: [
        { label: 'All Sites', href: '/infrastructure' },
        { label: 'Operational', href: '/infrastructure?status=operational' },
        { label: 'At Risk', href: '/infrastructure?status=at-risk' },
      ],
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      submenu: [
        { label: 'Reports', href: '/analytics/reports' },
        { label: 'Trends', href: '/analytics/trends' },
        { label: 'Predictions', href: '/analytics/predictions' },
      ],
    },
    {
      label: 'Monitoring',
      icon: MapPin,
      href: '/monitoring',
    },
    {
      label: 'Alerts',
      icon: AlertTriangle,
      href: '/alerts',
      badge: { count: 3, variant: 'danger' },
    },
  ]

  const adminMenuItems = [
    {
      label: 'Users',
      icon: Users,
      href: '/admin/users',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
    },
  ]

  const NavItem = ({
    item,
  }: {
    item: (typeof menuItems)[0] | (typeof adminMenuItems)[0]
  }) => {
    const Icon = item.icon
    const hasSubmenu = 'submenu' in item
    const expanded = expandedItems.includes(item.label)

    return (
      <div>
        <button
          onClick={() => {
            if (hasSubmenu) toggleExpand(item.label)
            else onClose()
          }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
            !hasSubmenu && isActive(item.href || '')
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon size={20} />
            <span className="font-medium">{item.label}</span>
            {!hasSubmenu && 'badge' in item && item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {item.badge.count}
              </span>
            )}
          </div>
          {hasSubmenu && (
            <ChevronDown
              size={16}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          )}
        </button>

        {/* Submenu */}
        {hasSubmenu && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-4 mt-2 space-y-1"
          >
            {item.submenu.map((subitem) => (
              <Link
                key={subitem.href}
                to={subitem.href}
                onClick={onClose}
                className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive(subitem.href)
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {subitem.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent">
            SIMRAS
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}

          {user?.role === 'ADMIN' && (
            <>
              <div className="my-4 border-t border-gray-200 dark:border-slate-800 pt-4">
                <p className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Administration
                </p>
              </div>
              {adminMenuItems.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 dark:border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
          <Link
            to="/profile"
            className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 mb-2"
          >
            Profile
          </Link>
          <button
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: open ? 0 : -256 }}
        className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 md:hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent">
            SIMRAS
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>

        <div className="border-t border-gray-200 dark:border-slate-800 p-4">
          <button
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </motion.aside>
    </>
  )
}
