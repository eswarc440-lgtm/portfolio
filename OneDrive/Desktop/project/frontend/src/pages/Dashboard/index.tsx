import { motion } from 'framer-motion'
import Card from '@/components/common/cards/Card'
import DashboardLayout from '@/layouts/DashboardLayout'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import { TrendingUp, AlertTriangle, Zap, Activity } from 'lucide-react'

/**
 * Dashboard Page
 * Main dashboard with KPI cards and charts
 */
export default function Dashboard() {
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

  const kpiData = [
    {
      icon: Zap,
      label: 'Total Infrastructure',
      value: '156',
      trend: '+12%',
      color: 'primary',
    },
    {
      icon: Activity,
      label: 'Operational',
      value: '151',
      trend: '+8%',
      color: 'green',
    },
    {
      icon: AlertTriangle,
      label: 'At Risk',
      value: '4',
      trend: '-2%',
      color: 'orange',
    },
    {
      icon: TrendingUp,
      label: 'Maintenance',
      value: '1',
      trend: '0%',
      color: 'yellow',
    },
  ]

  const colorClasses = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  }

  // Sample data for charts
  const trendData = [
    { month: 'Jan', operational: 140, maintenance: 5, risk: 5, damaged: 2 },
    { month: 'Feb', operational: 142, maintenance: 4, risk: 5, damaged: 1 },
    { month: 'Mar', operational: 145, maintenance: 3, risk: 4, damaged: 1 },
    { month: 'Apr', operational: 148, maintenance: 3, risk: 3, damaged: 1 },
    { month: 'May', operational: 150, maintenance: 2, risk: 3, damaged: 1 },
    { month: 'Jun', operational: 151, maintenance: 1, risk: 4, damaged: 0 },
  ]

  const statusData = [
    { name: 'Operational', value: 151 },
    { name: 'Maintenance', value: 1 },
    { name: 'At Risk', value: 4 },
    { name: 'Damaged', value: 0 },
  ]

  const vibrationData = [
    { time: '00:00', bridge: 2.1, tower: 1.8, dam: 1.5 },
    { time: '04:00', bridge: 2.3, tower: 1.9, dam: 1.6 },
    { time: '08:00', bridge: 2.5, tower: 2.1, dam: 1.7 },
    { time: '12:00', bridge: 2.7, tower: 2.3, dam: 1.9 },
    { time: '16:00', bridge: 2.4, tower: 2.0, dam: 1.8 },
    { time: '20:00', bridge: 2.2, tower: 1.9, dam: 1.6 },
  ]

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your infrastructure overview.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {kpiData.map((kpi, idx) => {
            const Icon = kpi.icon
            const colorClass = colorClasses[kpi.color as keyof typeof colorClasses]

            return (
              <motion.div key={idx} variants={itemVariants}>
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {kpi.trend}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{kpi.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Charts Grid */}
        <motion.div
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Status Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Infrastructure Status
              </h3>
              <PieChart
                data={statusData}
                colors={['#3b82f6', '#fbbf24', '#f97316', '#ef4444']}
                height={300}
              />
            </Card>
          </motion.div>

          {/* Status by Month */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status Trends
              </h3>
              <BarChart
                data={trendData}
                bars={[
                  { dataKey: 'operational', fill: '#10b981', name: 'Operational' },
                  { dataKey: 'maintenance', fill: '#fbbf24', name: 'Maintenance' },
                  { dataKey: 'risk', fill: '#f97316', name: 'At Risk' },
                  { dataKey: 'damaged', fill: '#ef4444', name: 'Damaged' },
                ]}
                height={300}
              />
            </Card>
          </motion.div>
        </motion.div>

        {/* Vibration Analysis */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Vibration Levels (24hr)
            </h3>
            <LineChart
              data={vibrationData}
              lines={[
                { dataKey: 'bridge', stroke: '#3b82f6', name: 'Golden Gate Bridge' },
                { dataKey: 'tower', stroke: '#8b5cf6', name: 'Tower Site 3' },
                { dataKey: 'dam', stroke: '#06b6d4', name: 'Dam Complex' },
              ]}
              height={350}
            />
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                {
                  title: 'Vibration Alert',
                  description: 'Golden Gate Bridge - Level exceeds threshold',
                  time: '2 min ago',
                  icon: AlertTriangle,
                },
                {
                  title: 'Maintenance Complete',
                  description: 'Tower Site 3 - Routine inspection completed',
                  time: '1 hour ago',
                  icon: Activity,
                },
                {
                  title: 'System Update',
                  description: 'New sensors deployed at Bay Bridge',
                  time: '3 hours ago',
                  icon: Zap,
                },
              ].map((activity, idx) => {
                const Icon = activity.icon
                return (
                  <div key={idx} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-b-0 border-gray-200 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800">
                      <Icon size={16} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{activity.time}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
