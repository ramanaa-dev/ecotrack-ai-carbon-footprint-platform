import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaLeaf, FaEnvelope, FaLock, FaGlobe } from 'react-icons/fa6';
import api from '../api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Check if redirected from expired session
  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      // Navigate to the page they tried to visit, or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setSuccessMsg(res.data.message);
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (err) {
      setError("Failed to trigger password reset request.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-6 overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full w-96 h-96 bg-gradient-to-tr from-ecoGreen to-transparent opacity-20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 rounded-full w-96 h-96 bg-gradient-to-br from-ecoCyan to-transparent opacity-20 blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* App Logo/Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-ecoGreen to-ecoCyan shadow-neon-green mb-4">
            <FaLeaf className="w-7 h-7 text-black animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">EcoTrack <span className="text-ecoGreen">AI</span></h2>
          <p className="text-sm text-zinc-400 mt-1 text-center font-medium">Real-Time Carbon Footprint Platform</p>
        </div>
        
        {/* Card Panel */}
        <div className="glass-panel rounded-3xl p-8 border border-white/5 shadow-2xl relative">
          <h3 className="text-xl font-bold text-white mb-6">Welcome Back</h3>
          
          {isExpired && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              Your session has expired. Please sign in again.
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-ecoGreen/10 border border-ecoGreen/20 text-ecoGreen text-xs font-medium">
              {successMsg}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white glass-input transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-ecoGreen hover:text-ecoGreen-light font-bold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white glass-input transition-all duration-200"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-ecoGreen to-ecoCyan hover:from-ecoGreen-light hover:to-ecoCyan-light text-black font-extrabold text-sm uppercase tracking-wider transition-all duration-300 shadow-neon-green hover:shadow-neon-cyan disabled:opacity-50"
            >
              {loading ? "Establishing connection..." : "Sign In Account"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-zinc-400 font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-ecoCyan hover:underline font-bold">
              Register here
            </Link>
          </div>
        </div>

        {/* Demo Credentials Alert Box */}
        <div className="mt-6 glass-panel rounded-2xl p-4 border border-white/5 text-center text-xs text-zinc-500">
          <p className="font-bold text-zinc-300 mb-1">💡 Demo Login Account:</p>
          <div className="flex flex-col gap-1 mb-2">
            <p>User: <span className="text-ecoGreen font-semibold">user@ecotrack.ai</span> | Pass: <span className="text-ecoGreen font-semibold">user123</span></p>
          </div>
          <p className="text-[11px] text-zinc-400 border-t border-white/5 pt-2 leading-relaxed text-left">
            Log in with the demo account above to see the pre-populated dashboard, historical logs, and ML-based forecasting trends. Or, navigate to the <strong>Register</strong> page to create a new profile, sign in, and track your own daily carbon activities!
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-white/10 p-6 relative">
            <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Enter your registered email address and we'll dispatch a link to securely reset your credentials.
            </p>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-bold block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2.5 rounded-xl bg-ecoGreen hover:bg-ecoGreen-light text-black text-xs font-bold"
                >
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
