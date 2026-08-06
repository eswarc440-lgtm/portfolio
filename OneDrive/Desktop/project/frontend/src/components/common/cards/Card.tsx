import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

/**
 * Card Component
 * Reusable card wrapper with consistent styling
 */
export default function Card({ 
  children, 
  className = '', 
  hover = true 
}: CardProps) {
  return (
    <div
      className={`
        rounded-lg border border-gray-200 dark:border-slate-800
        bg-white dark:bg-slate-900
        p-6 shadow-sm dark:shadow-none
        transition-all duration-200
        ${hover ? 'hover:shadow-md dark:hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
