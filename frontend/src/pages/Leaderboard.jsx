import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import api from '../api';
import { FaRankingStar, FaTrophy, FaLocationDot, FaCoins, FaCrown, FaAward } from 'react-icons/fa6';

const Leaderboard = () => {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      setBoard(res.data);
    } catch (error) {
      console.error("Failed to load leaderboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Get medals or trophy representation for top 3
  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <FaCrown className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] animate-bounce" />;
      case 2:
        return <FaTrophy className="w-4.5 h-4.5 text-zinc-300 drop-shadow-[0_0_6px_rgba(212,212,216,0.4)]" />;
      case 3:
        return <FaTrophy className="w-4 h-4 text-amber-600 drop-shadow-[0_0_4px_rgba(180,83,9,0.3)]" />;
      default:
        return <span className="text-zinc-500 font-bold text-xs">#{rank}</span>;
    }
  };

  const getScoreLevelColor = (level) => {
    switch (level) {
      case 'Climate Hero':
        return 'text-ecoGreen bg-ecoGreen/10 border-ecoGreen/20';
      case 'Green Warrior':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Eco Learner':
        return 'text-ecoCyan bg-ecoCyan/10 border-ecoCyan/20';
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FaRankingStar className="text-ecoGreen w-5 h-5" />
          <span>Global Leaderboard</span>
        </h1>
        <p className="text-xs text-zinc-500 font-medium">Compare progress with other users and climb ranks by earning eco points.</p>
      </div>

      {/* Top 3 podium highlight cards */}
      {board.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Rank 2 Card */}
          {board[1] && (
            <GlassCard className="text-center py-6 flex flex-col items-center justify-between border border-white/5 order-2 md:order-1 relative overflow-hidden">
              <div className="absolute top-2 left-2 text-zinc-500 font-bold text-[10px]">#2 RANK</div>
              <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-400 text-zinc-300 font-extrabold text-sm flex items-center justify-center mb-3">
                {board[1].fullname.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{board[1].fullname}</h4>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 justify-center">
                <FaLocationDot className="w-3 h-3 text-zinc-600" />
                <span>{board[1].city}, {board[1].country}</span>
              </span>
              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900 border border-white/5">
                <FaCoins className="w-3 h-3 text-ecoGreen" />
                <span className="text-xs font-bold text-white">{board[1].points} pts</span>
              </div>
            </GlassCard>
          )}

          {/* Rank 1 Card */}
          {board[0] && (
            <GlassCard className="text-center py-8 flex flex-col items-center justify-between border-2 border-yellow-400/20 shadow-neon-green order-1 md:order-2 relative overflow-hidden scale-105">
              <div className="bg-glow-green -top-24 -left-24 opacity-40 animate-pulse" />
              <div className="absolute top-2 left-2 text-yellow-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                <FaCrown className="w-3.5 h-3.5" />
                <span>CHAMPION</span>
              </div>
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-yellow-400 text-yellow-400 font-extrabold text-xl flex items-center justify-center mb-3 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)] animate-float">
                {board[0].fullname.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <h4 className="text-base font-extrabold text-white truncate max-w-[170px]">{board[0].fullname}</h4>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 justify-center">
                <FaLocationDot className="w-3 h-3 text-zinc-600" />
                <span>{board[0].city}, {board[0].country}</span>
              </span>
              <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-xl bg-zinc-900 border border-yellow-400/20 shadow-neon-green">
                <FaCoins className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-extrabold text-white">{board[0].points} pts</span>
              </div>
            </GlassCard>
          )}

          {/* Rank 3 Card */}
          {board[2] && (
            <GlassCard className="text-center py-6 flex flex-col items-center justify-between border border-white/5 order-3 md:order-3 relative overflow-hidden">
              <div className="absolute top-2 left-2 text-zinc-500 font-bold text-[10px]">#3 RANK</div>
              <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-amber-700 text-amber-500 font-extrabold text-sm flex items-center justify-center mb-3">
                {board[2].fullname.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <h4 className="text-sm font-bold text-white truncate max-w-[150px]">{board[2].fullname}</h4>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 justify-center">
                <FaLocationDot className="w-3 h-3 text-zinc-600" />
                <span>{board[2].city}, {board[2].country}</span>
              </span>
              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900 border border-white/5">
                <FaCoins className="w-3 h-3 text-ecoGreen" />
                <span className="text-xs font-bold text-white">{board[2].points} pts</span>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* Leaderboard Table List */}
      <GlassCard className="p-0 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-white/5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <th className="py-4 px-6 text-center w-20">Rank</th>
                <th className="py-4 px-6">Eco Warrior</th>
                <th className="py-4 px-6">Region</th>
                <th className="py-4 px-6 text-center">Score Level</th>
                <th className="py-4 px-6 text-center">Eco Score</th>
                <th className="py-4 px-6 text-right w-32">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {board.map((item) => {
                const isCurrentUser = item.id === user.id;
                
                return (
                  <tr 
                    key={item.id} 
                    className={`transition-colors duration-150
                      ${isCurrentUser 
                        ? 'bg-ecoGreen/[0.03] hover:bg-ecoGreen/[0.05] border-y border-ecoGreen/10 font-semibold' 
                        : 'hover:bg-white/[0.01]'
                      }
                    `}
                  >
                    {/* Rank */}
                    <td className="py-4 px-6 text-center font-bold">
                      <div className="flex justify-center items-center">
                        {getRankBadge(item.rank)}
                      </div>
                    </td>
                    
                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 border border-white/5 text-zinc-300 font-bold text-[10px]">
                          {item.fullname.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <span className={`text-white block truncate max-w-[180px] ${isCurrentUser ? 'text-ecoGreen font-bold' : ''}`}>
                            {item.fullname}
                          </span>
                          <span className="text-[10px] text-zinc-500 block truncate max-w-[180px]">{item.email}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Location */}
                    <td className="py-4 px-6 text-zinc-400">
                      <div className="flex items-center gap-1">
                        <FaLocationDot className="w-3 h-3 text-zinc-600 shrink-0" />
                        <span className="truncate max-w-[150px]">{item.city}, {item.country}</span>
                      </div>
                    </td>
                    
                    {/* Level Badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getScoreLevelColor(item.level)}`}>
                        {item.level}
                      </span>
                    </td>
                    
                    {/* Eco Score */}
                    <td className="py-4 px-6 text-center text-white font-extrabold text-sm">
                      {item.eco_score}
                    </td>
                    
                    {/* Total Points */}
                    <td className="py-4 px-6 text-right text-ecoGreen font-extrabold text-sm">
                      {item.points} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
};

export default Leaderboard;
