import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import api from '../api';
import { 
  FaBullseye, 
  FaPlus, 
  FaCalendarDays, 
  FaCheck, 
  FaTrashCan, 
  FaArrowRight, 
  FaRegCircleCheck, 
  FaRegCircleXmark,
  FaArrowTrendUp
} from 'react-icons/fa6';

const Goals = () => {
  const { refreshUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Goal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Manual progress state tracking
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editProgress, setEditProgress] = useState(0);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error) {
      console.error("Failed to load goals", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!title || !target || !deadline) {
      setFormError("All fields are required.");
      return;
    }

    setFormLoading(true);
    try {
      await api.post('/goals', {
        title,
        target: parseFloat(target),
        deadline
      });
      
      // Reset form
      setTitle('');
      setTarget('');
      setDeadline('');
      setShowAddForm(false);
      
      // Reload
      fetchGoals();
      refreshUser();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create goal.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProgress = async (goalId) => {
    try {
      await api.put(`/goals/${goalId}`, {
        progress: parseFloat(editProgress)
      });
      setEditingGoalId(null);
      fetchGoals();
      refreshUser();
    } catch (error) {
      console.error("Failed to update goal progress", error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.delete(`/goals/${goalId}`);
      fetchGoals();
      refreshUser();
    } catch (error) {
      console.error("Failed to delete goal", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FaBullseye className="text-ecoGreen w-5 h-5" />
            <span>Sustainability Goal Tracker</span>
          </h1>
          <p className="text-xs text-zinc-500 font-medium">Set targets, log activities and trace your achievements.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-ecoGreen hover:bg-ecoGreen-dark text-black text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-neon-green"
        >
          <FaPlus className="w-3.5 h-3.5" />
          <span>New Target Goal</span>
        </button>
      </div>

      {/* Goal Creation Form Modal overlay style (or inline toggled) */}
      {showAddForm && (
        <GlassCard className="relative overflow-hidden border border-ecoGreen/20">
          <div className="bg-glow-green -top-24 -left-24 opacity-30" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Define New Target</h3>
          
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Goal Description / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Reduce driving emissions, walk 5km daily"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
              />
            </div>
            
            <div>
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Target metric value (e.g. km or kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                placeholder="e.g. 50"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Deadline target date</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-zinc-400 glass-input outline-none focus:text-white"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/5 text-zinc-400 hover:text-white text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2.5 rounded-xl bg-ecoGreen hover:bg-ecoGreen-dark text-black text-xs font-extrabold uppercase tracking-wider transition-colors shadow-neon-green"
              >
                {formLoading ? "Saving..." : "Start Tracking Goal"}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Grid splits for Active & Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left column: Active Goals */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">Active Focus Goals ({activeGoals.length})</h3>
          
          {activeGoals.length === 0 ? (
            <div className="glass-panel rounded-2xl p-6 text-center text-zinc-500 text-xs">
              No active goals at this time. Click 'New Target Goal' above to start one!
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.map(goal => {
                const percent = Math.min(100, Math.round((goal.progress / goal.target) * 100));
                const isEditing = editingGoalId === goal.id;
                
                return (
                  <GlassCard key={goal.id} className="relative flex flex-col justify-between border-l-4 border-l-ecoCyan">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500 font-semibold">
                          <FaCalendarDays className="w-3 h-3" />
                          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (isEditing) {
                              handleUpdateProgress(goal.id);
                            } else {
                              setEditingGoalId(goal.id);
                              setEditProgress(goal.progress);
                            }
                          }}
                          className={`p-2 rounded-xl border border-white/5 transition-all text-xs font-bold flex items-center gap-1
                            ${isEditing 
                              ? 'bg-ecoGreen/10 border-ecoGreen/20 text-ecoGreen hover:bg-ecoGreen/20' 
                              : 'bg-zinc-900 text-zinc-400 hover:text-white'
                            }
                          `}
                          title={isEditing ? "Save Progress" : "Log Progress"}
                        >
                          {isEditing ? <FaCheck className="w-3.5 h-3.5" /> : <FaArrowTrendUp className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-red-400 hover:border-red-500/20 transition-all"
                          title="Delete Goal"
                        >
                          <FaTrashCan className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="mt-6 space-y-2">
                      {isEditing ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-400 font-bold shrink-0">Progress:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={editProgress}
                            onChange={(e) => setEditProgress(e.target.value)}
                            className="w-20 px-3 py-1 rounded-lg text-xs text-white glass-input"
                          />
                          <span className="text-xs text-zinc-500">/ {goal.target}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                          <span>Progress: {goal.progress} / {goal.target}</span>
                          <span className="text-ecoCyan">{percent}%</span>
                        </div>
                      )}
                      
                      {/* Bar */}
                      <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden border border-white/5">
                        <div 
                          className="bg-ecoCyan h-2 rounded-full shadow-neon-cyan transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Completed Goals */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">Achieved Goals ({completedGoals.length})</h3>
          
          {completedGoals.length === 0 ? (
            <div className="glass-panel rounded-2xl p-6 text-center text-zinc-500 text-xs">
              No completed goals archived yet. Complete active targets to populate.
            </div>
          ) : (
            <div className="space-y-4">
              {completedGoals.map(goal => (
                <GlassCard key={goal.id} className="relative border-l-4 border-l-ecoGreen opacity-75">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-300 line-through">{goal.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500 font-semibold">
                        <FaRegCircleCheck className="w-3.5 h-3.5 text-ecoGreen" />
                        <span>Completed Target successfully</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-600 hover:text-red-400 hover:border-red-500/20 transition-all"
                      title="Delete Goal Log"
                    >
                      <FaTrashCan className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-4 flex justify-between items-center text-xs font-bold text-zinc-500">
                    <span>Target Completed: {goal.target} units</span>
                    <span className="text-ecoGreen uppercase tracking-widest text-[9px] bg-ecoGreen/10 border border-ecoGreen/20 px-2.5 py-0.5 rounded-full">Completed</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Goals;
