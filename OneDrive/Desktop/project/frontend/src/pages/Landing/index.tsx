import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, TrendingUp, Microscope, Shield, BarChart3, CheckCircle } from 'lucide-react'
import Button from '@/components/common/buttons/Button'

/**
 * Landing Page
 * Production-ready homepage with Framer Motion animations
 */
export default function Landing() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  const slideInVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Monitoring',
      description: '24/7 live monitoring with instant alerts and notifications for any anomalies',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'AI-powered insights to predict maintenance needs before failures occur',
    },
    {
      icon: Microscope,
      title: 'Digital Twin',
      description: 'Virtual models of physical infrastructure for accurate simulations',
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'Enterprise-grade security with end-to-end encryption and compliance',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboards with customizable KPIs and reports',
    },
    {
      icon: Microscope,
      title: 'IoT Integration',
      description: 'Seamless integration with sensors and IoT devices for unified monitoring',
    },
  ]

  const stats = [
    { number: '99.9%', label: 'Uptime SLA' },
    { number: '50+', label: 'Infrastructure Sites' },
    { number: '1000+', label: 'Data Points/Min' },
    { number: '24/7', label: 'Expert Support' },
  ]

  const benefits = [
    'Reduce infrastructure downtime by up to 40%',
    'Cut maintenance costs through predictive insights',
    'Improve safety and compliance reporting',
    'Real-time risk assessment and mitigation',
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent"
          >
            SIMRAS
          </motion.div>
          <nav className="flex gap-4 items-center">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-blue-50 to-transparent dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center space-y-6"
          >
            <motion.div variants={itemVariants} className="inline-block">
              <div className="px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800">
                <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                  🚀 Enterprise Infrastructure Monitoring
                </p>
              </div>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-bold">
              <span className="text-gray-900 dark:text-white">Smart Infrastructure </span>
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent">
                Monitoring & Risk Assessment
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Real-time monitoring powered by AI-driven digital twin technology. Predict failures before they happen, reduce downtime, and optimize infrastructure performance.
            </motion.p>

            <motion.div variants={itemVariants} className="flex gap-4 justify-center pt-4">
              <Link to="/login">
                <Button variant="primary" size="lg" className="gap-2">
                  Start Free Trial <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900/50 border-y border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {stats.map((stat, idx) => (
              <motion.div key={idx} variants={scaleVariants}>
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Infrastructure
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to monitor and manage critical infrastructure
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <div className="p-8 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-primary-500/10 transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                      <Icon className="text-primary-600 dark:text-primary-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-y border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={slideInVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose SIMRAS?
              </h2>
              <motion.div
                variants={containerVariants}
                className="space-y-4"
              >
                {benefits.map((benefit, idx) => (
                  <motion.div key={idx} variants={itemVariants} className="flex gap-3 items-start">
                    <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-1" size={20} />
                    <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              variants={slideInVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-gray-200 dark:border-slate-800"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">
                    ENTERPRISE READY
                  </h3>
                  <p className="text-gray-900 dark:text-white font-semibold text-lg">
                    Built for Scale
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Trusted by government agencies and critical infrastructure organizations worldwide. Supports monitoring of hundreds of sites with millions of data points.
                </p>
                <Link to="/login">
                  <Button variant="primary" fullWidth>
                    Start Your Free Trial
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-bold text-gray-900 dark:text-white">
              Ready to Transform Your Infrastructure Monitoring?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 dark:text-gray-400">
              Join organizations that are already using SIMRAS to prevent infrastructure failures and optimize performance.
            </motion.p>
            <motion.div variants={itemVariants} className="flex gap-4 justify-center pt-4">
              <Link to="/login">
                <Button variant="primary" size="lg">
                  Get Started Now
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 py-12 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold text-gray-900 dark:text-white mb-4">SIMRAS</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Smart Infrastructure Monitoring & Risk Assessment System
              </p>
            </div>
            {[
              { title: 'Product', items: ['Features', 'Pricing', 'Security'] },
              { title: 'Company', items: ['About', 'Blog', 'Careers'] },
              { title: 'Resources', items: ['Docs', 'Support', 'Contact'] },
            ].map((col, idx) => (
              <div key={idx}>
                <p className="font-semibold text-gray-900 dark:text-white mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.items.map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-slate-800 pt-8">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              © 2026 SIMRAS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
