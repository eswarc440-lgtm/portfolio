import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/common/buttons/Button'
import Card from '@/components/common/cards/Card'
import toast from 'react-hot-toast'
import { AlertCircle } from 'lucide-react'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Login Page
 * User authentication form with validation
 */
export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@simras.local',
      password: 'password123',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SIMRAS</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors ${
                errors.email
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-slate-700'
              }`}
              placeholder="admin@simras.local"
            />
            {errors.email && (
              <div className="flex items-center gap-1 mt-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                {errors.email.message}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors ${
                errors.password
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-slate-700'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <div className="flex items-center gap-1 mt-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} />
                {errors.password.message}
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 dark:border-slate-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
            </label>
            <Link to="#" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">DEMO CREDENTIALS</p>
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Email: <span className="font-mono font-semibold">admin@simras.local</span>
          </p>
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Password: <span className="font-mono font-semibold">password123</span>
          </p>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="#" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  )
}
