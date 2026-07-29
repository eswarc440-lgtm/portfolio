import React, { useState } from 'react';
import { Mail, Lock, User, ShieldAlert, ArrowLeft, Leaf, Sparkles, CheckCircle2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserRole } from '../types';

interface LoginProps {
  onAuthSuccess: (user: any, role: UserRole) => void;
  onBackToLanding: () => void;
}

export default function Login({ onAuthSuccess, onBackToLanding }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [orgId, setOrgId] = useState('');
  const [department, setDepartment] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleError = (err: any) => {
    console.error("Auth action failed:", err);
    let msg = err.message || "An unexpected error occurred.";
    if (msg.includes("auth/operation-not-allowed") || err.code === "auth/operation-not-allowed") {
      msg = "Email/Password authentication is not yet enabled in your Firebase console. Please go to your Firebase Console -> Authentication -> Sign-in method, click 'Add new provider', select 'Email/Password' and enable it. In the meantime, you can sign in instantly using 'Google Auth' or by clicking one of the 'Quick Sandbox Launchers' below!";
    } else if (msg.includes("auth/invalid-credential")) {
      msg = "Invalid email or password combination.";
    } else if (msg.includes("auth/email-already-in-use")) {
      msg = "This email is already registered.";
    } else if (msg.includes("auth/weak-password")) {
      msg = "Password should be at least 6 characters long.";
    }
    setError(msg);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required credentials.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Retrieve role from localstorage or metadata. Since we are simulating, we check if the email has admin or domain-specific role.
      // If the email is eswarc440@gmail.com, let's make them an ADMIN by default, otherwise USER.
      const assignedRole: UserRole = (email.toLowerCase() === 'eswarc440@gmail.com' || email.toLowerCase().includes('admin')) ? 'ADMIN' : 'USER';
      onAuthSuccess(userCredential.user, assignedRole);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError("Please fill in Name, Email, and Password.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Capture details & forward
      const assignedRole = role; // selected in form
      onAuthSuccess(userCredential.user, assignedRole);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please input your email address first.");
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Verification reset link has been dispatched to your inbox.");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const assignedRole: UserRole = (userCredential.user.email?.toLowerCase() === 'eswarc440@gmail.com') ? 'ADMIN' : 'USER';
      onAuthSuccess(userCredential.user, assignedRole);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerMockAutologin = async (assignedRole: UserRole) => {
    setLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      onAuthSuccess({
        uid: userCredential.user.uid,
        email: assignedRole === 'ADMIN' ? 'admin@sattva.org' : 'user@sattva.org',
        displayName: assignedRole === 'ADMIN' ? 'BMK Vamsi' : 'jashwanth'
      }, assignedRole);
    } catch (err) {
      console.warn("Anonymous sandbox login failed. Falling back to offline memory mode.", err);
      onAuthSuccess({
        uid: "mock-user-123",
        email: assignedRole === 'ADMIN' ? 'admin@sattva.org' : 'user@sattva.org',
        displayName: assignedRole === 'ADMIN' ? 'BMK Vamsi' : 'jashwanth'
      }, assignedRole);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen-root" className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.04),transparent_50%)]">
      
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Leaf className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-slate-800 tracking-tight font-display">
          {isForgotPassword 
            ? "Reset Password" 
            : isRegistering 
              ? "Join Sattva Platform" 
              : "Access Sustainability Hub"}
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400 font-medium">
          {isForgotPassword 
            ? "We'll send you a recovery link to restore access" 
            : isRegistering 
              ? "Start tracking your carbon footprint and complete eco drills" 
              : "Review reports, check real-time ESG metrics, and log daily efforts"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-emerald-100/60 py-8 px-4 shadow-xl shadow-slate-100/50 rounded-3xl sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-800 text-xs p-3.5 rounded-xl flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3.5 rounded-xl flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 block w-full border border-slate-200 rounded-xl py-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/20 focus:bg-white transition-all outline-none"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setError(''); }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Return to sign in
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors"
              >
                {loading ? "Despatching link..." : "Despatch Recovery Link"}
              </button>
            </form>
          ) : isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 block w-full border border-slate-200 rounded-xl py-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/20 focus:bg-white transition-all outline-none"
                    placeholder="Eswar Kumar"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 block w-full border border-slate-200 rounded-xl py-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/20 focus:bg-white transition-all outline-none"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Secure Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 block w-full border border-slate-200 rounded-xl py-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/20 focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Assign Platform Role</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                      role === 'USER' 
                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold' 
                        : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span>🌿 Standard User</span>
                    <span className="text-[9px] font-normal text-slate-400 leading-tight">Log footprints & claim badges</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                      role === 'ADMIN' 
                        ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold' 
                        : 'border-slate-150 bg-slate-50/50 hover:bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span>🛡️ Authority Admin</span>
                    <span className="text-[9px] font-normal text-slate-400 leading-tight">Manage ESG & telemetry variables</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Org ID (Optional)</label>
                  <input
                    type="text"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="mt-1 block w-full border border-slate-200 rounded-lg p-2 text-xs outline-none bg-slate-50/20 focus:bg-white"
                    placeholder="e.g. ECO-CORP"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-1 block w-full border border-slate-200 rounded-lg p-2 text-xs outline-none bg-slate-50/20 focus:bg-white"
                    placeholder="e.g. Engineering"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setError(''); }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Already have an account? Sign in
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors"
              >
                {loading ? "Creating Profile..." : "Deploy Profile"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 block w-full border border-slate-200 rounded-xl py-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/20 focus:bg-white transition-all outline-none"
                    placeholder="you@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Secure Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 block w-full border border-slate-200 rounded-xl py-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/20 focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Forgot password?
                </button>

                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setError(''); }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Create new profile
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors"
              >
                {loading ? "Verifying..." : "Sign In to Console"}
              </button>
            </form>
          )}

          {/* Social and Quick Sign in Separator */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-50"></div>
              </div>
              <div className="relative flex justify-center text-[9px]">
                <span className="px-2.5 bg-white text-slate-400 font-bold font-mono uppercase tracking-wider">SECURE MULTI-TENANCY PROVIDER</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50/80 transition-colors"
              >
                <span className="mr-2">🌍</span> Sign in with Google Auth
              </button>
            </div>

            {/* Quick Sandbox Bypass button for fast testing without needing real Firebase Auth triggers */}
            <div className="mt-4 pt-4 border-t border-emerald-50">
              <div className="text-center text-[9px] font-bold font-mono text-slate-400 mb-2.5 uppercase tracking-wider">QUICK SANDBOX LAUNCHERS (BYPASS AUTH)</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => triggerMockAutologin('USER')}
                  type="button"
                  className="px-3 py-2 border border-dashed border-emerald-200 rounded-xl text-emerald-800 text-[10px] font-bold bg-emerald-50/20 hover:bg-emerald-50/60 transition-colors"
                >
                  Login as User 🌿
                </button>
                <button
                  onClick={() => triggerMockAutologin('ADMIN')}
                  type="button"
                  className="px-3 py-2 border border-dashed border-indigo-200 rounded-xl text-indigo-800 text-[10px] font-bold bg-indigo-50/20 hover:bg-indigo-50/60 transition-colors"
                >
                  Login as Admin 🛡️
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
