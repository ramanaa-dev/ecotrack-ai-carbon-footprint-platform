import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { FaUser, FaLock, FaEnvelope, FaGlobe, FaCity, FaBriefcase, FaIdCard, FaCircleCheck, FaCircleExclamation } from 'react-icons/fa6';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  // Profile state
  const [fullname, setFullname] = useState(user?.fullname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || '');
  const [age, setAge] = useState(user?.age || '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status flags
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false });
  
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ text: '', isError: false });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', isError: false });
    
    if (!fullname || !email || !city || !country) {
      setProfileMsg({ text: "Name, Email, City, and Country are required fields.", isError: true });
      return;
    }
    
    setProfileLoading(true);
    const res = await updateProfile({
      fullname,
      email,
      city,
      country,
      age: age ? parseInt(age) : null,
      occupation
    });
    setProfileLoading(false);
    
    if (res.success) {
      setProfileMsg({ text: "Profile details updated successfully!", isError: false });
    } else {
      setProfileMsg({ text: res.message, isError: true });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', isError: false });
    
    if (!currentPassword || !newPassword) {
      setPassMsg({ text: "Please enter your current password and a new password.", isError: true });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPassMsg({ text: "New password and confirmation do not match.", isError: true });
      return;
    }
    
    setPassLoading(true);
    const res = await changePassword({
      current_password: currentPassword,
      new_password: newPassword
    });
    setPassLoading(false);
    
    if (res.success) {
      setPassMsg({ text: "Password changed successfully!", isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassMsg({ text: res.message, isError: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Summary */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="text-center relative">
            <div className="bg-glow-green -top-20 -left-20 opacity-30" />
            <div className="flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-zinc-800 border-2 border-ecoGreen text-ecoGreen font-extrabold text-3xl mb-4">
              {user?.fullname ? user.fullname.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : 'US'}
            </div>
            
            <h3 className="text-xl font-bold text-white truncate">{user?.fullname}</h3>
            <span className="text-xs font-semibold uppercase tracking-widest text-ecoGreen bg-ecoGreen/10 px-3 py-1 rounded-full mt-1.5 inline-block">
              {user?.role === 'admin' ? 'SYSTEM ADMIN' : 'ECO WARRIOR'}
            </span>
            
            <div className="border-t border-white/5 mt-6 pt-6 text-left space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase">Eco Points:</span>
                <span className="text-white font-extrabold text-sm">{user?.points || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase">Carbon Level:</span>
                <span className="text-white font-bold">{user?.points >= 500 ? 'Sustainability Master' : 'Eco Learner'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase">Active Region:</span>
                <span className="text-white font-bold truncate max-w-[150px]">{user?.city}, {user?.country}</span>
              </div>
            </div>
          </GlassCard>
        </div>
        
        {/* Profile Details Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="relative">
            <div className="bg-glow-cyan -bottom-20 -right-20 opacity-20" />
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FaUser className="text-ecoGreen w-4 h-4" />
              <span>Personal Information</span>
            </h3>
            
            {profileMsg.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-2.5 border text-xs font-medium ${
                profileMsg.isError 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                  : 'bg-ecoGreen/10 border-ecoGreen/20 text-ecoGreen'
              }`}>
                {profileMsg.isError ? <FaCircleExclamation className="w-4 h-4 shrink-0" /> : <FaCircleCheck className="w-4 h-4 shrink-0" />}
                <span>{profileMsg.text}</span>
              </div>
            )}
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full name */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Full Name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>
                </div>

                {/* Email (cannot change username, but we allow email adjustments) */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Email Address *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
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
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
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
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>
                </div>

              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 rounded-xl bg-ecoGreen hover:bg-ecoGreen-dark text-black font-bold text-xs uppercase tracking-wider transition-all duration-200"
                >
                  {profileLoading ? "Updating..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Change Password Card */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <FaLock className="text-ecoCyan w-4 h-4" />
              <span>Change Security Password</span>
            </h3>

            {passMsg.text && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-2.5 border text-xs font-medium ${
                passMsg.isError 
                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                  : 'bg-ecoGreen/10 border-ecoGreen/20 text-ecoGreen'
              }`}>
                {passMsg.isError ? <FaCircleExclamation className="w-4 h-4 shrink-0" /> : <FaCircleCheck className="w-4 h-4 shrink-0" />}
                <span>{passMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                  />
                </div>

              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-6 py-2.5 rounded-xl bg-ecoCyan hover:bg-ecoCyan-dark text-black font-bold text-xs uppercase tracking-wider transition-all duration-200"
                >
                  {passLoading ? "Changing..." : "Update Password"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
