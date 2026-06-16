import React from 'react';
import GlassCard from './GlassCard';

const StatCard = ({ label, value, icon: Icon, description, trend, type = 'green', className = '' }) => {
  const glowClass = type === 'cyan' ? 'bg-glow-cyan -top-24 -right-24' : 'bg-glow-green -top-24 -right-24';
  const textClass = type === 'cyan' ? 'text-ecoCyan' : 'text-ecoGreen';
  const borderHover = type === 'cyan' ? 'hover:border-ecoCyan/30' : 'hover:border-ecoGreen/30';
  
  return (
    <GlassCard className={`relative flex flex-col justify-between min-h-[140px] hover:scale-[1.02] border border-white/5 transition-all duration-300 ${borderHover} ${className}`}>
      {/* Background glow radial gradient */}
      <div className={`absolute rounded-full w-48 h-48 opacity-40 blur-3xl pointer-events-none ${glowClass}`} />
      
      <div className="flex justify-between items-start z-10">
        <div>
          <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
          <h3 className="text-3xl font-extrabold mt-1 text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-zinc-900/60 border border-white/5 ${textClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 z-10">
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-ecoGreen/10 text-ecoGreen'}`}>
            {trend > 0 ? `+${trend}` : trend}%
          </span>
        )}
        <span className="text-zinc-500 text-xs font-medium">{description}</span>
      </div>
    </GlassCard>
  );
};

export default StatCard;
