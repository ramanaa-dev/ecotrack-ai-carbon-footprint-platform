import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import api from '../api';
import { 
  FaShieldHalved, 
  FaUsers, 
  FaDatabase, 
  FaChartSimple, 
  FaLeaf, 
  FaTrashCan, 
  FaPlus,
  FaLocationDot
} from 'react-icons/fa6';

const AdminDashboard = () => {
  const [adminStats, setAdminStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New challenge form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [duration, setDuration] = useState('7 Days');
  
  const [chalLoading, setChalLoading] = useState(false);
  const [chalSuccess, setChalSuccess] = useState('');
  const [chalError, setChalError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setAdminStats(statsRes.data);
      
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Failed to load admin dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setChalSuccess('');
    setChalError('');

    if (!title || !description || !points) {
      setChalError("Please fill out all challenge fields.");
      return;
    }

    setChalLoading(true);
    try {
      await api.post('/admin/challenges', {
        title,
        description,
        points: parseInt(points),
        duration
      });
      
      setChalSuccess("Challenge successfully launched! Users notified.");
      setTitle('');
      setDescription('');
      setPoints('');
      
      // Reload stats
      loadAdminData();
    } catch (error) {
      setChalError("Failed to create challenge.");
    } finally {
      setChalLoading(false);
    }
  };

  const handleDeleteUser = async (userId, fullname) => {
    if (!window.confirm(`Are you sure you want to delete user: ${fullname}? This action is permanent and removes all carbon history.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      // Reload
      loadAdminData();
    } catch (error) {
      alert("Failed to delete user account.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FaShieldHalved className="text-ecoCyan w-5 h-5" />
          <span>Global Administration Control Panel</span>
        </h1>
        <p className="text-xs text-zinc-500 font-medium">Monitor global activity, manage community members, and launch eco challenges.</p>
      </div>

      {/* Admin stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Global Members" 
          value={adminStats?.total_users || 0} 
          icon={FaUsers} 
          description="Total registered user accounts"
          type="cyan"
        />
        <StatCard 
          label="Emissions Tracked" 
          value={`${adminStats?.total_emissions_logged || 0} kg`} 
          icon={FaLeaf} 
          description="Net cumulative carbon logged"
          type="green"
        />
        <StatCard 
          label="Activity Logs" 
          value={adminStats?.total_records || 0} 
          icon={FaDatabase} 
          description="Total database entries logged"
          type="cyan"
        />
        <StatCard 
          label="Avg Eco Score" 
          value={`${adminStats?.avg_eco_score || 0}/100`} 
          icon={FaChartSimple} 
          description="Platform wide average score"
          type="green"
        />
      </div>

      {/* Grid: Launch Challenge vs User List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Launch Challenge Form */}
        <div className="lg:col-span-1">
          <GlassCard className="relative h-full flex flex-col justify-between">
            <div className="bg-glow-cyan -top-24 -right-24 opacity-30" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <FaPlus className="text-ecoCyan w-4 h-4" />
                <span>Launch Community Challenge</span>
              </h3>
              <p className="text-zinc-500 text-[11px] leading-relaxed mb-6">Launch daily/weekly challenges to motivate users. Completing them rewards points.</p>
              
              {chalSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-ecoGreen/10 border border-ecoGreen/20 text-ecoGreen text-xs font-semibold">
                  {chalSuccess}
                </div>
              )}

              {chalError && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {chalError}
                </div>
              )}

              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Challenge Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. No Beef Week"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs text-white glass-input"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7 Days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs text-white glass-input"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Points Reward Value</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs text-white glass-input"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Mission Details / Description</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Describe what users need to do to complete this challenge..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl text-xs text-white glass-input outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={chalLoading}
                  className="w-full py-2.5 rounded-xl bg-ecoCyan hover:bg-ecoCyan-dark text-black text-xs font-extrabold uppercase tracking-wider transition-colors shadow-neon-cyan"
                >
                  {chalLoading ? "Launching Mission..." : "Broadcast Challenge"}
                </button>
              </form>
            </div>
          </GlassCard>
        </div>

        {/* Registered Users Management Table */}
        <div className="lg:col-span-2">
          <GlassCard className="p-0 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-white/5 bg-zinc-950/40">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manage Platform Members</h3>
              <p className="text-zinc-500 text-[10px] font-medium mt-0.5">Edit credentials or wipe user profiles from the local database.</p>
            </div>

            <div className="flex-1 overflow-auto max-h-[460px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950/60 border-b border-white/5 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                    <th className="py-3 px-4 w-12 text-center">ID</th>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Privilege</th>
                    <th className="py-3 px-4 text-center">Eco Points</th>
                    <th className="py-3 px-4 text-right pr-6 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-zinc-500">#{u.id}</td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="text-white font-bold block">{u.fullname}</span>
                          <span className="text-[10px] text-zinc-500 block">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                          <FaLocationDot className="w-3 h-3 text-zinc-600 shrink-0" />
                          <span>{u.city}, {u.country}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border
                          ${u.role === 'admin' 
                            ? 'text-ecoCyan bg-ecoCyan/10 border-ecoCyan/20' 
                            : 'text-zinc-400 bg-zinc-900 border-white/5'
                          }
                        `}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-ecoGreen font-extrabold">{u.points} pts</td>
                      <td className="py-3.5 px-4 text-right pr-6">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.fullname)}
                          className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-red-400 hover:border-red-500/20 transition-all"
                          title="Delete User profile"
                        >
                          <FaTrashCan className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
