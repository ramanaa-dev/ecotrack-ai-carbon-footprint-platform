import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import api from '../api';
import { 
  FaTrophy, 
  FaAward, 
  FaLock, 
  FaFlag, 
  FaHourglassHalf, 
  FaCircleCheck, 
  FaBolt, 
  FaUserMinus, 
  FaStar,
  FaLeaf,
  FaCalendarWeek,
  FaChartSimple,
  FaCrown
} from 'react-icons/fa6';

const Challenges = () => {
  const { refreshUser } = useAuth();
  
  const [challenges, setChallenges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('challenges'); // 'challenges' or 'achievements'
  
  // Completed challenge points modal/feedback
  const [pointsAwarded, setPointsAwarded] = useState(null);

  const fetchChallengesAndBadges = async () => {
    try {
      const chalRes = await api.get('/challenges');
      setChallenges(chalRes.data);
      
      const achRes = await api.get('/challenges/achievements');
      setAchievements(achRes.data);
    } catch (error) {
      console.error("Failed to load challenges and badges", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengesAndBadges();
  }, []);

  const handleJoinChallenge = async (id) => {
    try {
      await api.post(`/challenges/${id}/join`);
      fetchChallengesAndBadges();
    } catch (error) {
      console.error("Failed to join challenge", error);
    }
  };

  const handleCompleteChallenge = async (id) => {
    try {
      const res = await api.post(`/challenges/${id}/complete`);
      setPointsAwarded(res.data.points_earned);
      fetchChallengesAndBadges();
      refreshUser();
      
      // Auto-hide alert after 5 seconds
      setTimeout(() => setPointsAwarded(null), 5000);
    } catch (error) {
      console.error("Failed to complete challenge", error);
    }
  };

  // Badge icons mapping function based on badge key
  const getBadgeIcon = (key) => {
    switch (key) {
      case 'first_entry':
        return { icon: FaLeaf, color: 'text-ecoGreen border-ecoGreen/20 bg-ecoGreen/10', glow: 'shadow-neon-green' };
      case 'green_week':
        return { icon: FaCalendarWeek, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', glow: 'shadow-neon-green' };
      case 'carbon_reducer':
        return { icon: FaChartSimple, color: 'text-ecoCyan border-ecoCyan/20 bg-ecoCyan/10', glow: 'shadow-neon-cyan' };
      case 'climate_champion':
        return { icon: FaTrophy, color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10', glow: 'shadow-neon-green' };
      case 'sustainability_master':
        return { icon: FaCrown, color: 'text-purple-400 border-purple-500/20 bg-purple-500/10', glow: 'shadow-neon-cyan' };
      default:
        return { icon: FaAward, color: 'text-zinc-400 border-white/10 bg-zinc-900', glow: '' };
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
      
      {/* Header & Tabs Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FaTrophy className="text-ecoGreen w-5 h-5" />
            <span>Gamification & Community</span>
          </h1>
          <p className="text-xs text-zinc-500 font-medium">Participate in global eco missions and unlock custom profile badges.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 p-1 bg-zinc-950/80 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveView('challenges')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
              ${activeView === 'challenges' 
                ? 'bg-zinc-900 text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
              }
            `}
          >
            Eco Challenges
          </button>
          <button
            onClick={() => setActiveView('achievements')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
              ${activeView === 'achievements' 
                ? 'bg-zinc-900 text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
              }
            `}
          >
            Earned Badges
          </button>
        </div>
      </div>

      {/* Points Reward Notification toast */}
      {pointsAwarded && (
        <div className="p-4 rounded-2xl bg-ecoGreen/10 border border-ecoGreen/30 text-ecoGreen text-xs font-bold flex items-center gap-2 max-w-md mx-auto animate-bounce">
          <FaCircleCheck className="w-4 h-4 shrink-0" />
          <span>Success! Challenge completed. You gained +{pointsAwarded} Eco Points!</span>
        </div>
      )}

      {/* Rendering tab: Challenges */}
      {activeView === 'challenges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map(chal => {
            const isJoined = chal.user_status === 'joined';
            const isCompleted = chal.user_status === 'completed';
            
            return (
              <GlassCard 
                key={chal.id} 
                className={`relative flex flex-col justify-between min-h-[220px] transition-all border
                  ${isCompleted 
                    ? 'border-ecoGreen/20 bg-ecoGreen/[0.01]' 
                    : isJoined 
                      ? 'border-ecoCyan/20 bg-ecoCyan/[0.01]' 
                      : 'border-white/5'
                  }
                `}
              >
                <div className="z-10">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <FaHourglassHalf className="w-3 h-3" />
                      <span>Duration: {chal.duration}</span>
                    </span>
                    <span className="text-xs font-extrabold text-ecoGreen flex items-center gap-1 bg-ecoGreen/10 px-2 py-0.5 rounded-lg border border-ecoGreen/20">
                      <FaBolt className="w-3 h-3" />
                      <span>+{chal.points} pts</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">{chal.title}</h3>
                  <p className="text-zinc-400 text-xs mt-2 leading-relaxed">{chal.description}</p>
                </div>

                <div className="mt-6 border-t border-white/5 pt-4 flex justify-between items-center z-10">
                  {/* Status Indicator */}
                  <div>
                    {isCompleted ? (
                      <span className="text-[10px] font-bold text-ecoGreen flex items-center gap-1 uppercase tracking-wider">
                        <FaCircleCheck className="w-3.5 h-3.5" />
                        <span>Mission Achieved</span>
                      </span>
                    ) : isJoined ? (
                      <span className="text-[10px] font-bold text-ecoCyan flex items-center gap-1 uppercase tracking-wider">
                        <FaStar className="w-3.5 h-3.5 animate-pulse" />
                        <span>Active Journey</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Available</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div>
                    {!isJoined && !isCompleted && (
                      <button
                        onClick={() => handleJoinChallenge(chal.id)}
                        className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/10 hover:bg-zinc-800 text-xs font-bold text-white transition-all"
                      >
                        Join Mission
                      </button>
                    )}
                    {isJoined && (
                      <button
                        onClick={() => handleCompleteChallenge(chal.id)}
                        className="px-4 py-2 rounded-xl bg-ecoGreen hover:bg-ecoGreen-dark text-black text-xs font-extrabold transition-all"
                      >
                        Claim Completion
                      </button>
                    )}
                    {isCompleted && (
                      <span className="text-xs text-zinc-500 font-bold bg-zinc-900 px-3 py-1.5 rounded-xl border border-white/5 select-none">
                        Completed ✓
                      </span>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Rendering tab: Achievements */}
      {activeView === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map(ach => {
            const badgeMeta = getBadgeIcon(ach.badge);
            const BadgeIcon = badgeMeta.icon;
            
            return (
              <GlassCard 
                key={ach.id} 
                className={`relative flex flex-col items-center text-center p-6 border transition-all duration-300
                  ${ach.earned 
                    ? `border-white/10 bg-zinc-950/20 ${badgeMeta.glow}` 
                    : 'border-white/5 opacity-45'
                  }
                `}
              >
                {/* Badge Image representation */}
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 transition-all duration-300
                  ${ach.earned 
                    ? badgeMeta.color 
                    : 'bg-zinc-900/60 border-white/5 text-zinc-600'
                  }
                `}>
                  {ach.earned ? (
                    <BadgeIcon className="w-8 h-8 animate-float" />
                  ) : (
                    <FaLock className="w-6 h-6" />
                  )}
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">{ach.title}</h3>
                <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed max-w-[200px]">{ach.description}</p>
                
                {ach.earned ? (
                  <span className="text-[10px] font-semibold text-ecoGreen mt-4 uppercase tracking-widest bg-ecoGreen/10 border border-ecoGreen/20 px-2 py-0.5 rounded-full">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-zinc-500 mt-4 uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded-full">
                    Locked
                  </span>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Challenges;
