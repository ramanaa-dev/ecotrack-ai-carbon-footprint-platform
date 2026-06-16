import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaCheck, FaCoins, FaBars } from 'react-icons/fa6';
import api from '../api';

const Navbar = ({ toggleSidebar }) => {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('calculator')) return 'Carbon Footprint Calculator';
    if (path.includes('goals')) return 'Sustainability Goals';
    if (path.includes('challenges')) return 'Eco Challenges & Badges';
    if (path.includes('leaderboard')) return 'Eco Leaderboard';
    if (path.includes('history')) return 'Carbon History Log';
    if (path.includes('predictions')) return 'ML Carbon Forecasting';
    if (path.includes('profile')) return 'Profile Management';
    if (path.includes('admin')) return 'Global Admin Dashboard';
    return 'Platform';
  };

  // Fetch user notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/auth/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications and user points updates every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      refreshUser();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/auth/notifications/${id}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-10 flex items-center justify-between h-20 px-4 sm:px-8 bg-black/40 backdrop-blur-md border-b border-white/5 select-none">
      {/* Title with Mobile Burger Menu Toggle */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white lg:hidden"
        >
          <FaBars className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">{getPageTitle()}</h2>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium">Real-time Environmental Insights</p>
        </div>
      </div>

      {/* Info & Notification center */}
      <div className="flex items-center gap-6">
        {/* Points Display */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 border border-white/5 shadow-inner">
          <FaCoins className="w-4 h-4 text-ecoGreen" />
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Eco Score Balance:</span>
          <span className="text-sm font-bold text-white">{user?.points || 0}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-3 rounded-xl bg-zinc-900/60 border border-white/5 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all duration-200"
          >
            <FaBell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-zinc-900 animate-pulse"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto glass-panel rounded-2xl border border-white/10 shadow-2xl py-3 flex flex-col z-50">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-white/5">
                <span className="text-sm font-bold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                    {unreadCount} Unread
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  No notifications yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-4 flex flex-col gap-1 transition-colors duration-150 ${notif.is_read ? 'bg-transparent' : 'bg-white/[0.02]'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-xs font-bold ${notif.is_read ? 'text-zinc-400' : 'text-ecoGreen'}`}>
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="p-1 rounded-md bg-zinc-950 text-zinc-400 hover:text-ecoGreen hover:bg-zinc-900 transition-colors"
                            title="Mark as read"
                          >
                            <FaCheck className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-zinc-600 mt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
