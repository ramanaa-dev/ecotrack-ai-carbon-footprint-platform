import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaLeaf, 
  FaTrophy, 
  FaBullseye, 
    FaRankingStar, 
    FaClockRotateLeft, 
    FaBrain, 
    FaCircleUser, 
    FaShieldHalved,
    FaRightFromBracket,
    FaChartSimple
  } from 'react-icons/fa6';
  import { MdDashboard } from 'react-icons/md';
  
  const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
  
    const handleLogout = () => {
      logout();
      navigate('/login');
    };
  
    const navItems = [
      { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
      { name: 'Carbon Calculator', path: '/calculator', icon: FaLeaf },
      { name: 'Goal Tracker', path: '/goals', icon: FaBullseye },
      { name: 'Eco Challenges', path: '/challenges', icon: FaTrophy },
      { name: 'Leaderboard', path: '/leaderboard', icon: FaRankingStar },
      { name: 'Carbon History', path: '/history', icon: FaClockRotateLeft },
      { name: 'ML Predictions', path: '/predictions', icon: FaBrain },
      { name: 'Profile Settings', path: '/profile', icon: FaCircleUser },
    ];

  return (
    <>
      {/* Mobile background overlay click handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col justify-between w-64 h-screen bg-black border-r border-white/5 glass-panel select-none transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-ecoGreen to-ecoCyan shadow-neon-green">
              <FaLeaf className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                EcoTrack <span className="text-ecoGreen font-extrabold">AI</span>
              </h1>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest block -mt-1">Sustainability Platform</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-ecoGreen/10 to-transparent text-ecoGreen border-l-2 border-ecoGreen font-bold' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            
            {/* Admin specific link */}
            {user && user.role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group border-t border-white/5 pt-4 mt-4
                  ${isActive 
                    ? 'bg-gradient-to-r from-ecoCyan/10 to-transparent text-ecoCyan border-l-2 border-ecoCyan font-bold' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }
                `}
              >
                <FaShieldHalved className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Admin Dashboard</span>
              </NavLink>
            )}
          </nav>
        </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-white/5 bg-zinc-950/40">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 border border-white/10 text-ecoGreen font-bold text-sm">
            {user?.fullname ? user.fullname.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : 'US'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">{user?.fullname || 'Eco User'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FaChartSimple className="w-3 h-3 text-ecoGreen" />
              <span className="text-[11px] text-zinc-400 font-bold">{user?.points || 0} Points</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 text-xs font-bold transition-all duration-200"
        >
          <FaRightFromBracket className="w-3.5 h-3.5" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  </>
);
};

export default Sidebar;
