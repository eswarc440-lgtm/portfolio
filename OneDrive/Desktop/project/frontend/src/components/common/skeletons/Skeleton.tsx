import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  count?: number
}

/**
 * Skeleton Loader Component
 * Reusable skeleton for loading states
 */
export function SkeletonLine({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-slate-800 rounded ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 space-y-4">
      <SkeletonLine className="h-6 w-24" />
      <SkeletonLine className="h-10 w-full" />
      <SkeletonLine className="h-4 w-1/2" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonLine className="h-8 w-48" />
        <SkeletonLine className="h-4 w-96" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className="p-6 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
            <SkeletonLine className="h-6 w-32 mb-4" />
            <SkeletonLine className="h-64 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
