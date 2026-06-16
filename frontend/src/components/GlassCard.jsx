import React from 'react';

const GlassCard = ({ children, className = '', hover = false, hoverCyan = false }) => {
  const hoverClass = hover 
    ? 'glass-panel-hover' 
    : hoverCyan 
      ? 'glass-panel-hover-cyan' 
      : '';
      
  return (
    <div className={`glass-panel rounded-2xl p-6 shadow-glass relative overflow-hidden transition-all duration-300 ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
