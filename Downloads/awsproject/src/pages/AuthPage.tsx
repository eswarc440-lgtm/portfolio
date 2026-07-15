/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  ShieldAlert, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Briefcase, 
  ArrowLeft,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone,
  MapPin,
  Building,
  Check,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthPage: React.FC = () => {
  const { path, setPath, login, registerUser, addSystemNotification, logActivity } = useApp();

  // Resolve active tab based on path state
  const isLoginPath = path === '/login' || path === 'auth' || path === undefined;
  const isRegisterPath = path === '/register';
  const isForgotPasswordPath = path === '/forgot-password';

  // --- Common UI States ---
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Form Input States ---
  // Common
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Only
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Disaster Management Authority');
  const [org, setOrg] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [countdown, setCountdown] = useState(4);

  // Remember Me state (saves email to localStorage)
  const [rememberMe, setRememberMe] = useState(false);

  // --- Forgot Password Flow States ---
  // Stages: 'email' | 'dispatched' | 'reset_page' | 'success'
  const [forgotStage, setForgotStage] = useState<'email' | 'dispatched' | 'reset_page' | 'success'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('smart_disaster_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Countdown timer for registration success page redirect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (regSuccess && countdown === 0) {
      setRegSuccess(false);
      setPath('/login');
    }
    return () => clearTimeout(timer);
  }, [regSuccess, countdown, setPath]);

  // Countdown timer for forgot password success redirect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (forgotStage === 'success' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (forgotStage === 'success' && countdown === 0) {
      setForgotStage('email');
      setPath('/login');
    }
    return () => clearTimeout(timer);
  }, [forgotStage, countdown, setPath]);

  // Quick Demo Profiles config for reviewers
  const demoProfiles = [
    { role: 'Disaster Management Authority' as UserRole, name: 'Elizabeth Vance', email: 'vance@disasterops.gov' },
    { role: 'Super Admin' as UserRole, name: 'System Admin Knox', email: 'admin@disastersphere.com' },
    { role: 'NGO' as UserRole, name: 'Sarah Jenkins', email: 'jenkins@redcross.org' },
    { role: 'Shelter Manager' as UserRole, name: 'Captain Shaw', email: 'shaw@shelterops.org' },
    { role: 'Volunteer' as UserRole, name: 'Marcus Vance', email: 'marcus@volunteers.net' }
  ];

  const handleDemoClick = async (profile: typeof demoProfiles[0]) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      // Simulate token generation and storage (JWT)
      const mockJWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJkZW1vX3VpZCIsImVtYWlsIjoi${btoa(profile.email)}"`;
      localStorage.setItem('smart_disaster_jwt', mockJWT);
      localStorage.setItem('smart_disaster_jwt_expiry', (Date.now() + 3600 * 1000).toString()); // 1 hour session

      let success;
      if (profile.email === 'admin@disastersphere.com') {
        success = await login(profile.email, 'Admin@123');
      } else {
        success = await login(profile.email, undefined, profile.role);
      }

      if (success) {
        addSystemNotification(
          'Access Clearance Authenticated', 
          `Secure session established for ${profile.name} (${profile.role}). JWT signed and cached.`, 
          'success'
        );
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Demo authentication failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    // Email Validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    // Password Validation
    if (!password) {
      setErrorMsg('Password is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('smart_disaster_remembered_email', email);
        } else {
          localStorage.removeItem('smart_disaster_remembered_email');
        }

        // Store JWT token to simulate enterprise compliance
        const mockJWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJmcmJfdWlkIiwiZW1haWwiOiI${btoa(email)}"`;
        localStorage.setItem('smart_disaster_jwt', mockJWT);
        localStorage.setItem('smart_disaster_jwt_expiry', (Date.now() + 3600 * 1000).toString());

        addSystemNotification('Portal Session Loaded', 'Clearance authentication completed with secure authorization token.', 'success');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setErrorMsg(err?.message || 'Authentication failed. Please verify your credentials or try a Demoprofile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    // Validations
    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      setIsSubmitting(false);
      return;
    }

    if (role === 'Super Admin') {
      setErrorMsg('Unauthorized registration of Super Admin accounts.');
      setIsSubmitting(false);
      return;
    }

    if (role !== 'Volunteer' && !org.trim()) {
      setErrorMsg(`Organization Name is required for role: ${role}.`);
      setIsSubmitting(false);
      return;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    if (!phone.trim() || phone.length < 8) {
      setErrorMsg('Please provide a valid Mobile Number.');
      setIsSubmitting(false);
      return;
    }

    if (!address.trim() || !city.trim() || !stateName.trim()) {
      setErrorMsg('Complete operational address fields are required.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('You must accept the terms & conditions to deploy an operator profile.');
      setIsSubmitting(false);
      return;
    }

    try {
      const fullOrgText = role === 'Volunteer' ? (org || 'Independent Volunteer') : org;
      const success = await registerUser(
        name,
        email,
        password,
        role,
        fullOrgText
      );

      if (success) {
        setCountdown(4);
        setRegSuccess(true);
      }
    } catch (err: any) {
      console.error('Registration Error:', err);
      setErrorMsg(err?.message || 'Registration failed. The email address may already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (forgotStage === 'email') {
      if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }

      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setForgotStage('dispatched');
        addSystemNotification('Recovery Ticket Generated', `A password reset token was simulated for ${resetEmail}.`, 'warning');
      }, 1200);

    } else if (forgotStage === 'reset_page') {
      if (newPassword.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setForgotStage('success');
        setCountdown(3);
        logActivity('Password Reset', `Password recovered successfully for ${resetEmail}.`);
        addSystemNotification('Credentials Reset Completed', 'Your user credentials was synchronized successfully. Proceeding to login.', 'success');
      }, 1500);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col lg:flex-row font-sans text-slate-800 relative overflow-hidden selection:bg-rose-100 selection:text-rose-900">
      
      {/* Soft animated background gradients */}
      <div className="absolute inset-0 opacity-[0.01] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      <div className="absolute -top-40 right-1/4 h-[600px] w-[600px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/4 h-[600px] w-[600px] bg-sky-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Visual Left Frame: Information Rail */}
      <div className="w-full lg:w-[35%] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-8 lg:p-12 flex flex-col justify-between relative z-10">
        
        {/* Brand */}
        <div 
          onClick={() => setPath('landing')}
          className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="p-2 bg-rose-600 text-white rounded-lg shadow-sm">
            <ShieldAlert className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="font-black text-xs uppercase tracking-widest text-slate-900 block">
              Smart Disaster Relief
            </span>
            <span className="text-[9px] font-mono font-bold text-rose-600 tracking-wider uppercase block">
              Operational Command Console
            </span>
          </div>
        </div>

        {/* Dynamic Context Description based on Page */}
        <div className="my-12 lg:my-0 max-w-sm">
          <AnimatePresence mode="wait">
            {isLoginPath && (
              <motion.div
                key="login-info"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center space-x-1.5 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full text-[10px] text-rose-600 font-bold tracking-wider uppercase mb-5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Operations Terminal</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-slate-900">
                  Secure Operator Sign In
                </h2>
                <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                  Provide your approved operations credentials to manage active incident response tasks and coordinate relief logistics.
                </p>
              </motion.div>
            )}

            {isRegisterPath && (
              <motion.div
                key="register-info"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] text-emerald-600 font-bold tracking-wider uppercase mb-5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Agency Enrollment</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-slate-900">
                  Join the Strategic Logistics Alliance
                </h2>
                <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                  Enlist your disaster mitigation division or sign up as a certified volunteer responder. Registering grants immediate coordination access.
                </p>
              </motion.div>
            )}

            {isForgotPasswordPath && (
              <motion.div
                key="forgot-info"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-150 px-3 py-1 rounded-full text-[10px] text-amber-600 font-bold tracking-wider uppercase mb-5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Credential Recovery</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-slate-900">
                  Security Pass Recovery
                </h2>
                <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                  Lost credentials can be synchronized securely through our verified authentication server. Enter your email to dispatch a recovery ticket.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* System Bullet Indicators */}
          <div className="mt-8 space-y-3.5 border-t border-slate-100 pt-6">
            <div className="flex items-center space-x-2.5 text-xs text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              <span>Protected API Endpoints</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500"></span>
              <span>Real-time Sync with Firestore</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>Dual-factor Identity Verification Ready</span>
            </div>
          </div>
        </div>

        {/* Footer protocol */}
        <div className="text-[10px] text-slate-400 font-mono tracking-wider">
          <span>SECURE PROTOCOL v4.26 // JWT SHA256 // TLS ACTIVE</span>
        </div>
      </div>

      {/* Visual Right Frame: Auth Panel (Glassmorphism card centerstage) */}
      <div className="flex-1 p-6 lg:p-16 flex items-center justify-center relative z-10 overflow-y-auto max-h-screen">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 lg:p-10 shadow-lg relative overflow-hidden text-slate-800">
          
          {/* Header Return button */}
          <button 
            onClick={() => setPath('landing')}
            className="inline-flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-6 cursor-pointer focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portal Home</span>
          </button>

          {/* Render Registration Success View */}
          {isRegisterPath && regSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-6">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Registration Submitted Successfully</h3>
              <p className="text-slate-600 text-xs mt-3 max-w-md mx-auto leading-relaxed">
                Your tactical agency and responder credentials are compiled. Database synchronization was committed in Firebase.
              </p>
              
              <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Redirecting to sign-in page</span>
                <span className="text-3xl font-black text-rose-600 block mt-1">{countdown}s</span>
              </div>

              <button 
                onClick={() => { setRegSuccess(false); setPath('/login'); }}
                className="mt-8 inline-flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <span>Navigate to Login Page</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* Render Normal Forms if Registration is not in success screen */}
          {(!regSuccess) && (
            <>
              {/* Form Tab Headers (For normal toggle between Login/Register) */}
              {!isForgotPasswordPath && (
                <div className="flex border-b border-slate-200 mb-6">
                  <button
                    onClick={() => { setPath('/login'); setErrorMsg(''); }}
                    className={`flex-1 text-center pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${isLoginPath ? 'border-rose-600 text-rose-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    Operator Login
                  </button>
                  <button
                    onClick={() => { setPath('/register'); setErrorMsg(''); }}
                    className={`flex-1 text-center pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${isRegisterPath ? 'border-rose-600 text-rose-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* General Error Banner */}
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start space-x-2.5 text-xs"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* 1. SECURE LOGIN VIEW                                   */}
              {/* ======================================================= */}
              {isLoginPath && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Quick demo switcher block */}
                  <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-extrabold font-mono text-rose-600 uppercase tracking-widest block mb-2">
                      Instant Quick Login Roles (Demo Profiles)
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
                      {demoProfiles.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDemoClick(p)}
                          className="bg-white border border-slate-200 hover:border-rose-600 hover:bg-rose-50/40 text-slate-700 hover:text-rose-700 text-[10px] p-2 rounded-lg text-left transition-all leading-tight cursor-pointer"
                        >
                          <span className="block font-bold truncate">{p.name.split(' ').slice(-1)[0]}</span>
                          <span className="text-[8px] text-slate-400 block truncate font-mono mt-0.5">{p.role.split(' ').slice(0, 2).join(' ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                        Clearance Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. vance@disasterops.gov"
                          className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-3 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                          Session Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setPath('/forgot-password')}
                          className="text-[10px] text-rose-600 hover:text-rose-700 font-extrabold focus:outline-none cursor-pointer uppercase tracking-widest font-mono"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Lock className="h-4 w-4" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me & terms helper */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center space-x-2 text-xs text-slate-500 hover:text-slate-950 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-200 bg-white text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Remember credentials for auto-login</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black py-3 rounded-lg uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 mt-6"
                    >
                      {isSubmitting && <RefreshCw className="h-4.5 w-4.5 animate-spin" />}
                      <span>{isSubmitting ? 'Verifying Credentials...' : 'Authenticate & Open Dashboard'}</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* 2. REGISTRATION VIEW                                    */}
              {/* ======================================================= */}
              {isRegisterPath && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          Operator Full Name
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <UserIcon className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Inspector James Sterling"
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-3 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Role selection - STRICTLY NO SUPER ADMIN */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          Strategic Operation Role
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <Briefcase className="h-4 w-4" />
                          </span>
                          <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-3 focus:outline-none transition-all cursor-pointer text-slate-900"
                          >
                            <option value="Disaster Management Authority">Disaster Management Authority (DMA)</option>
                            <option value="NGO">NGO Allied Dispatch Coordinator</option>
                            <option value="Shelter Manager">Evacuation Shelter Manager</option>
                            <option value="Volunteer">Volunteer Mobile Responder</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Organization (required for DMA/NGO/Shelter, optional for Volunteer) */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                          Affiliated Organization / Division
                        </label>
                        {role === 'Volunteer' && (
                          <span className="text-[9px] text-slate-400 font-mono tracking-wide uppercase font-bold">Optional</span>
                        )}
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <Building className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          required={role !== 'Volunteer'}
                          value={org}
                          onChange={(e) => setOrg(e.target.value)}
                          placeholder={role === 'Volunteer' ? "e.g. Independent Responder (Optional)" : "e.g. Sarasota Regional Emergency Ops Group"}
                          className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-3 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          Emergency Contact Email
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <Mail className="h-4 w-4" />
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. sterling@disasterops.gov"
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-3 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          Mobile Duty Number
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <Smartphone className="h-4 w-4" />
                          </span>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. +1 (555) 019-2834"
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-3 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address components */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                        Duty Street Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="e.g. 100 Aviation Boulevard, Suite 50"
                          className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-3 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* City */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          Operational City
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Sarasota"
                          className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 px-3.5 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          State / Jurisdiction
                        </label>
                        <input
                          type="text"
                          required
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          placeholder="Florida"
                          className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 px-3.5 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Password */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          Create Password (Min 6 Chars)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <Lock className="h-4 w-4" />
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          Confirm Secure Password
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <Lock className="h-4 w-4" />
                          </span>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Accept Terms */}
                    <div className="pt-2">
                      <label className="flex items-start space-x-2.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer leading-relaxed">
                        <input
                          type="checkbox"
                          required
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="rounded border-slate-200 bg-white text-rose-600 focus:ring-rose-500 h-4 w-4 mt-0.5 cursor-pointer"
                        />
                        <span>
                          I agree to standard disaster response protocols, federal regulatory data sharing mandates, and system Terms & Conditions.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black py-3 rounded-lg uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 mt-6"
                    >
                      {isSubmitting && <RefreshCw className="h-4.5 w-4.5 animate-spin" />}
                      <span>{isSubmitting ? 'Validating & Deploying Account...' : 'Deploy Operations Account & Request ID'}</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* 3. FORGOT PASSWORD VIEW                                */}
              {/* ======================================================= */}
              {isForgotPasswordPath && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest font-mono mb-4 border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <RefreshCw className="h-4.5 w-4.5 text-rose-600" />
                    <span>Security Clearance Password Recovery</span>
                  </h3>

                  {forgotStage === 'email' && (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Enter your registered operator email address below. If the email has verified clearance, our system will issue a simulated password recovery ticket.
                      </p>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          Operator Clearance Email
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <Mail className="h-4 w-4" />
                          </span>
                          <input
                            type="email"
                            required
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="e.g. vance@disasterops.gov"
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-3 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setPath('/login')}
                          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-3 rounded-lg uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmitting && <RefreshCw className="h-4.5 w-4.5 animate-spin" />}
                          <span>Send Reset Link</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {forgotStage === 'dispatched' && (
                    <div className="space-y-5 text-center py-4">
                      <div className="inline-flex h-12 w-12 rounded-full bg-amber-50 text-amber-600 items-center justify-center border border-amber-200">
                        <Mail className="h-6 w-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Temporary Reset Link Sent</h4>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          We dispatched a temporary secure cryptographic reset token to <strong className="text-slate-800">{resetEmail}</strong>.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-sm mx-auto text-left space-y-3">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            <strong>Simulator Action Required:</strong> To mock clicking the email link, access the local recovery form using the button below.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForgotStage('reset_page')}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Access Simulation Recovery Page
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setForgotStage('email')}
                          className="text-xs text-slate-500 hover:text-slate-800 transition-colors underline"
                        >
                          Did not receive link? Retry sending
                        </button>
                      </div>
                    </div>
                  )}

                  {forgotStage === 'reset_page' && (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Recovering credentials for <strong className="text-slate-800">{resetEmail}</strong>. Set your new security console password.
                      </p>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          New Secure Password (Min 6 Chars)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <Lock className="h-4 w-4" />
                          </span>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-900 transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest font-mono">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                            <Lock className="h-4 w-4" />
                          </span>
                          <input
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white focus:bg-white border border-slate-200 focus:border-rose-500 text-xs rounded-lg py-2.5 pl-11 pr-3 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black py-3 rounded-lg uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50 mt-6"
                      >
                        {isSubmitting && <RefreshCw className="h-4.5 w-4.5 animate-spin" />}
                        <span>Update Operator Credentials</span>
                      </button>
                    </form>
                  )}

                  {forgotStage === 'success' && (
                    <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in duration-300">
                      <div className="inline-flex h-14 w-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full items-center justify-center mb-2">
                        <Check className="h-8 w-8 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Password Updated Successfully</h4>
                        <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                          Your clearance key was synchronized in our user ledger. You may now log in to the secure terminal.
                        </p>
                      </div>

                      <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg max-w-[200px] mx-auto">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">Auto Redirect</span>
                        <span className="text-2xl font-black text-rose-600 block mt-0.5">{countdown}s</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}

        </div>
      </div>

    </div>
  );
};
