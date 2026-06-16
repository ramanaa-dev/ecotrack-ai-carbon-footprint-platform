import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import api from '../api';
import { 
  FaLeaf, 
  FaCoins, 
  FaChartArea, 
  FaCalendarDays, 
  FaCalendarWeek, 
  FaCalendarPlus,
  FaArrowRight,
  FaHourglassHalf,
  FaAward
} from 'react-icons/fa6';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [tip, setTip] = useState('');
  const [activeGoal, setActiveGoal] = useState(null);
  const [rank, setRank] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      // 1. Fetch stats
      const statsRes = await api.get('/carbon/stats');
      setStats(statsRes.data);
      
      // 2. Fetch recommendations & tips
      const recRes = await api.get('/carbon/recommendations');
      setTip(recRes.data.daily_eco_tip);
      
      // 3. Fetch goals to find the most recent active one
      const goalsRes = await api.get('/goals');
      const active = goalsRes.data.find(g => g.status === 'active');
      setActiveGoal(active || null);
      
      // 4. Fetch leaderboard to determine user rank
      const leadRes = await api.get('/leaderboard');
      const userRank = leadRes.data.find(u => u.id === user.id)?.rank || 1;
      setRank(userRank);
      
    } catch (error) {
      console.error("Failed to load dashboard statistics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Pie chart colors mapping
  const COLORS = ['#22C55E', '#EAB308', '#F97316', '#06B6D4']; // Green, Yellow, Orange, Cyan

  const categoryData = stats?.category_split || [];
  const chartHistory = stats?.chart_history || [];
  
  const getScoreLevel = (score) => {
    if (score >= 90) return { title: "Climate Hero", color: "text-ecoGreen bg-ecoGreen/10 border-ecoGreen/20" };
    if (score >= 70) return { title: "Green Warrior", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 50) return { title: "Eco Learner", color: "text-ecoCyan bg-ecoCyan/10 border-ecoCyan/20" };
    return { title: "Beginner", color: "text-red-400 bg-red-500/10 border-red-500/20" };
  };

  const scoreLevel = getScoreLevel(stats?.today?.score || 100);

  return (
    <div className="space-y-6">
      
      {/* Welcome & Eco Tip Alert banner */}
      <div className="relative overflow-hidden glass-panel rounded-3xl p-6 border border-white/5 shadow-glass">
        <div className="bg-glow-green -top-24 -left-24 opacity-35" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome, {user?.fullname}!</h1>
            <p className="text-zinc-400 text-xs mt-0.5">Let's check your climate impact today.</p>
          </div>
          <div className="max-w-md p-3 rounded-2xl bg-zinc-900/80 border border-white/5 text-xs flex gap-2">
            <span className="text-lg">💡</span>
            <div>
              <span className="text-zinc-500 font-bold uppercase block tracking-wider text-[10px]">Daily Eco Tip</span>
              <p className="text-zinc-300 font-medium leading-relaxed">{tip || "Log your carbon activities regularly to unlock customized sustainability recommendations."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Today's Emission" 
          value={`${stats?.today?.total || 0} kg`} 
          icon={FaLeaf} 
          description="Carbon output logged today"
          type="green"
        />
        <StatCard 
          label="Weekly Emission" 
          value={`${stats?.weekly?.total || 0} kg`} 
          icon={FaCalendarWeek} 
          description="Cumulative last 7 days"
          type="green"
        />
        <StatCard 
          label="Monthly Emission" 
          value={`${stats?.monthly?.total || 0} kg`} 
          icon={FaCalendarDays} 
          description="Cumulative last 30 days"
          type="cyan"
        />
        <StatCard 
          label="Eco Rank" 
          value={`#${rank}`} 
          icon={FaAward} 
          description="Position in community leaderboard"
          type="cyan"
        />
      </div>

      {/* Main charts splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (Recharts) */}
        <div className="lg:col-span-2">
          <GlassCard className="h-[380px] flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Carbon Footprint Trend</h3>
                <span className="text-[10px] text-zinc-500 font-medium">Daily emission tracker history logs (kg CO2)</span>
              </div>
              <FaChartArea className="w-5 h-5 text-ecoGreen" />
            </div>

            <div className="flex-1 min-h-0">
              {chartHistory.length === 0 ? (
                <div className="h-full flex justify-center items-center text-zinc-500 text-xs">
                  No tracking entries registered. Use the Carbon Calculator to start logs.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="total" name="Emissions (kg)" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Categories Share Pie Chart */}
        <div className="lg:col-span-1">
          <GlassCard className="h-[380px] flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Carbon Breakdown</h3>
              <span className="text-[10px] text-zinc-500 font-medium">Distribution of footprint elements</span>
            </div>

            <div className="flex-1 min-h-0 relative flex items-center justify-center">
              {categoryData.every(c => c.value === 0) ? (
                <div className="text-zinc-500 text-xs">No data elements available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="48%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '11px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      iconSize={8} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Goals & Active entries list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Eco Score & Level Card */}
        <GlassCard className="flex flex-col justify-between min-h-[200px]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Eco Score Standing</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">Your sustainability standing evaluates your carbon output logs relative to targeted limits.</p>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div>
              <h2 className="text-5xl font-black text-white tracking-tight">{stats?.today?.score || 100}</h2>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mt-1">Global Eco Score Rating</span>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border text-center ${scoreLevel.color}`}>
                {scoreLevel.title}
              </span>
              <p className="text-[11px] text-zinc-500 leading-snug">Level thresholds range from Beginner up to Climate Hero (90+ score).</p>
            </div>
          </div>
        </GlassCard>

        {/* Goal Tracker snippet */}
        <GlassCard className="flex flex-col justify-between min-h-[200px]">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Goal Focus</h3>
              <FaCoins className="w-4 h-4 text-ecoCyan" />
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">Ensure regular logging of daily activities to automatically increment active goals.</p>
          </div>

          <div className="mt-4">
            {activeGoal ? (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-300 truncate max-w-[200px]">{activeGoal.title}</span>
                  <span className="text-ecoGreen">{Math.round((activeGoal.progress / activeGoal.target) * 100)}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-ecoGreen h-1.5 rounded-full shadow-neon-green" 
                    style={{ width: `${Math.min(100, (activeGoal.progress / activeGoal.target) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-medium">
                  <span>Current: {activeGoal.progress}</span>
                  <span>Target: {activeGoal.target}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <span className="text-zinc-500 text-xs block">No active goals focused currently.</span>
                <button
                  onClick={() => navigate('/goals')}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/10 hover:bg-zinc-800 text-xs font-bold text-white flex items-center justify-center gap-1.5 mx-auto transition-all"
                >
                  <span>Create Goal Target</span>
                  <FaArrowRight className="w-3 h-3 text-ecoGreen" />
                </button>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

    </div>
  );
};

export default Dashboard;
