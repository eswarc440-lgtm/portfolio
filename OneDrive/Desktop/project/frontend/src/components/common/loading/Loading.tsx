import { motion } from 'framer-motion'

/**
 * Loading Component
 * Spinner for loading states
 */
export default function Loading() {
  const dotVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: 0.1,
      },
    },
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-500 dark:border-t-primary-400 rounded-full"
        />

        {/* Loading Text with Dots */}
        <div className="flex items-center gap-1">
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading</p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                variants={dotVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.1 }}
                className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Page Loading Component
 * Shows loading state for full pages
 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-primary-200 dark:border-primary-800 border-t-primary-500 dark:border-t-primary-400 rounded-full mx-auto mb-4"
        />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </motion.div>
    </div>
  )
}

/**
 * Inline Loading Component
 * Small loader for inline elements
 */
export function InlineLoading() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-4 h-4 border-2 border-primary-200 dark:border-primary-800 border-t-primary-500 dark:border-t-primary-400 rounded-full"
    />
  )
}
