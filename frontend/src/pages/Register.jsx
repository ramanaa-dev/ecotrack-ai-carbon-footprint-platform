import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaLeaf, FaUser, FaEnvelope, FaLock, FaGlobe, FaCity, FaBriefcase, FaIdCard } from 'react-icons/fa6';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [role, setRole] = useState('user'); // Default 'user'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!fullname || !email || !password || !city || !country) {
      setError("Please fill in all required fields (Name, Email, Password, City, Country)");
      return;
    }
    
    setLoading(true);
    const result = await register({
      fullname,
      email,
      password,
      city,
      country,
      age: age ? parseInt(age) : null,
      occupation,
      role
    });
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-6 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full w-96 h-96 bg-gradient-to-tr from-ecoGreen to-transparent opacity-15 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 rounded-full w-96 h-96 bg-gradient-to-br from-ecoCyan to-transparent opacity-15 blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-2xl z-10 my-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-ecoGreen to-ecoCyan shadow-neon-green mb-3">
            <FaLeaf className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">EcoTrack <span className="text-ecoGreen">AI</span></h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-medium">Create your sustainability profile today</p>
        </div>
        
        {/* Card */}
        <div className="glass-panel rounded-3xl p-8 border border-white/5 shadow-2xl relative">
          <h3 className="text-lg font-bold text-white mb-6">Create Account</h3>
          
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Full Name *</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Email Address *</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Password *</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Age</label>
                <div className="relative">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="number"
                    min="1"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">City *</label>
                <div className="relative">
                  <FaCity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="Seattle"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Country *</label>
                <div className="relative">
                  <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>
              </div>

              {/* Occupation */}
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Occupation</label>
                <div className="relative">
                  <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Software Engineer"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>
              </div>

            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-ecoGreen to-ecoCyan hover:from-ecoGreen-light hover:to-ecoCyan-light text-black font-extrabold text-sm uppercase tracking-wider transition-all duration-300 shadow-neon-green hover:shadow-neon-cyan disabled:opacity-50"
            >
              {loading ? "Creating Sustainability Profile..." : "Register & Start Tracking"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-zinc-400 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-ecoCyan hover:underline font-bold">
              Sign in here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
