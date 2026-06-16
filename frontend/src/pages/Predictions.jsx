import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import api from '../api';
import { 
  FaBrain, 
  FaCalendarWeek, 
  FaCalendarDays, 
  FaCircleInfo, 
  FaChartLine 
} from 'react-icons/fa6';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const Predictions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPredictions = async () => {
    try {
      const res = await api.get('/carbon/predict');
      setData(res.data);
    } catch (error) {
      console.error("Failed to load carbon predictions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const trendData = data?.historical_trend || [];
  const isSimulated = data?.is_simulated;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FaBrain className="text-ecoGreen w-5 h-5 animate-pulse" />
          <span>Machine Learning Forecasting</span>
        </h1>
        <p className="text-xs text-zinc-500 font-medium">Predicting future carbon trends based on historical activities and trend regression.</p>
      </div>

      {/* Model Status Warning / Info Banner */}
      <div className={`p-4 rounded-3xl border flex gap-3 z-10 relative overflow-hidden
        ${isSimulated 
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
          : 'bg-ecoGreen/10 border-ecoGreen/20 text-ecoGreen'
        }
      `}>
        <FaCircleInfo className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block">
            {isSimulated ? 'Simulated Baseline Trend Model' : 'ML Regression Model active'}
          </span>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            {data?.message || (isSimulated 
              ? "We need at least 3 historical logs to generate actual ML regressions. Currently showing generic trend estimates." 
              : "Model successfully fitted with your personal logging history. Predictions reflect your lifestyle directions.")}
          </p>
        </div>
      </div>

      {/* Metric projections cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          label="Next Week Projection" 
          value={`${data?.next_week_prediction || 0} kg`} 
          icon={FaCalendarWeek} 
          description="Estimated daily average next week"
          type="green"
        />
        <StatCard 
          label="Next Month Projection" 
          value={`${data?.next_month_prediction || 0} kg`} 
          icon={FaCalendarDays} 
          description="Estimated daily average next month"
          type="cyan"
        />
      </div>

      {/* Prediction Chart mapping */}
      <GlassCard className="h-[420px] flex flex-col justify-between relative">
        <div className="bg-glow-cyan -bottom-24 -right-24 opacity-30" />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Actual vs Predicted Carbon Curve</h3>
            <span className="text-[10px] text-zinc-500 font-medium">Visualizing previous entries against forecasted projections (kg CO2)</span>
          </div>
          <FaChartLine className="w-5 h-5 text-ecoCyan" />
        </div>

        <div className="flex-1 min-h-0">
          {trendData.length === 0 ? (
            <div className="h-full flex justify-center items-center text-zinc-500 text-xs">
              Insufficient data elements to render chart coordinates.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold', fontSize: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  iconSize={10}
                  wrapperStyle={{ fontSize: '11px', color: '#a1a1aa', paddingTop: '15px' }}
                />
                
                {/* Area of actual emissions */}
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  name="Logged Footprint (Actual)" 
                  fill="#22C55E" 
                  stroke="#22C55E" 
                  fillOpacity={0.06}
                  strokeWidth={2}
                  connectNulls
                />
                
                {/* Line of regression forecast */}
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  name="ML Regression Trend (Predicted)" 
                  stroke="#06B6D4" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>

    </div>
  );
};

export default Predictions;
