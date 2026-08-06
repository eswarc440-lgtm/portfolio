import { useState } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/common/cards/Card'
import Button from '@/components/common/buttons/Button'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useTheme } from '@/hooks/useTheme'

/**
 * Settings Page
 * Application settings
 */
export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your experience</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive alerts and updates</p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500" />
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Critical Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Important system notifications</p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-300 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500" />
                </label>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Keys</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Generate and manage API keys for programmatic access
            </p>
            <Button variant="outline" fullWidth>
              Generate New API Key
            </Button>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-4">
          <Button variant="secondary" fullWidth>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={handleSave}>
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
