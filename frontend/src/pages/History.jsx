import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import api from '../api';
import { 
  FaClockRotateLeft, 
  FaCalendarDays, 
  FaFileCsv, 
  FaFilePdf, 
  FaMagnifyingGlass, 
  FaTrashCan, 
  FaFilter,
  FaCheck
} from 'react-icons/fa6';

const History = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Export states
  const [exportScope, setExportScope] = useState('all'); // 'all', 'weekly', 'monthly', 'daily'
  const [exportLoading, setExportLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Build query string
      let url = '/carbon/history';
      const params = [];
      if (startDate) params.push(`start_date=${startDate}`);
      if (endDate) params.push(`end_date=${endDate}`);
      if (params.length > 0) url += `?${params.join('&')}`;
      
      const res = await api.get(url);
      setRecords(res.data);
    } catch (error) {
      console.error("Failed to load historical data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [startDate, endDate]);

  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      const res = await api.get(`/reports/export?format=${format}&type=${exportScope}`, {
        responseType: 'blob' // Essential for receiving binaries (PDF/CSV)
      });
      
      // Create download link
      const blob = new Blob([res.data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const fileExt = format === 'pdf' ? 'pdf' : 'csv';
      link.setAttribute('download', `ecotrack_report_${exportScope}_${new Date().toISOString().slice(0, 10)}.${fileExt}`);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to export report document", error);
    } finally {
      setExportLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-ecoGreen';
    if (score >= 70) return 'text-emerald-400';
    if (score >= 50) return 'text-ecoCyan';
    return 'text-red-400';
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FaClockRotateLeft className="text-ecoGreen w-5 h-5" />
            <span>Carbon Footprint Logs</span>
          </h1>
          <p className="text-xs text-zinc-500 font-medium">Browse, search, sort, and export your previous climate tracking entries.</p>
        </div>
      </div>

      {/* Control panel: Filters and export */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Date Filter Card */}
        <GlassCard className="lg:col-span-2 relative">
          <div className="bg-glow-green -top-24 -left-24 opacity-20" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <FaFilter className="text-ecoGreen w-3.5 h-3.5" />
            <span>Filter Search Records</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-zinc-400 glass-input outline-none focus:text-white"
              />
            </div>
            
            <div>
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-zinc-400 glass-input outline-none focus:text-white"
              />
            </div>
          </div>

          {(startDate || endDate) && (
            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-zinc-500 hover:text-white"
              >
                Clear Date Filters
              </button>
            </div>
          )}
        </GlassCard>

        {/* Report Exporting Card */}
        <GlassCard className="lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <FaFilePdf className="text-ecoCyan w-3.5 h-3.5" />
              <span>Export Custom Report</span>
            </h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed mb-4">Export logged emissions history as CSV sheets or structured PDF documents.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Select Report Scope</label>
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs text-zinc-400 glass-input bg-zinc-950 outline-none focus:text-white font-semibold"
              >
                <option value="all">Cumulative History (All)</option>
                <option value="monthly">Last 30 Days (Monthly)</option>
                <option value="weekly">Last 7 Days (Weekly)</option>
                <option value="daily">Today's logs (Daily)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                disabled={exportLoading || records.length === 0}
                onClick={() => handleExport('csv')}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30"
              >
                <FaFileCsv className="w-4 h-4 text-ecoGreen" />
                <span>Export CSV</span>
              </button>
              <button
                disabled={exportLoading || records.length === 0}
                onClick={() => handleExport('pdf')}
                className="flex-1 py-2.5 rounded-xl bg-ecoCyan hover:bg-ecoCyan-dark text-black text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30 shadow-neon-cyan"
              >
                <FaFilePdf className="w-4 h-4 text-black" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* Main Table view of Logs */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-ecoGreen border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs">
              No historical records registered under selected filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950/60 border-b border-white/5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  <th className="py-4 px-6">Date Logged</th>
                  <th className="py-4 px-6 text-center">Transportation (kg)</th>
                  <th className="py-4 px-6 text-center">Energy usage (kg)</th>
                  <th className="py-4 px-6 text-center">Food (kg)</th>
                  <th className="py-4 px-6 text-center">Waste & Recycling (kg)</th>
                  <th className="py-4 px-6 text-center">Total Footprint</th>
                  <th className="py-4 px-6 text-right">Eco Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.01] transition-colors">
                    {/* Date */}
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <FaCalendarDays className="w-3.5 h-3.5 text-zinc-600" />
                        <span>{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    
                    {/* Categories breakdowns */}
                    <td className="py-4 px-6 text-center">{r.transportation_emission}</td>
                    <td className="py-4 px-6 text-center">{r.energy_emission}</td>
                    <td className="py-4 px-6 text-center">{r.food_emission}</td>
                    <td className="py-4 px-6 text-center">{r.waste_emission}</td>
                    
                    {/* Total */}
                    <td className="py-4 px-6 text-center text-white font-extrabold">
                      {r.total_emission} kg
                    </td>
                    
                    {/* Eco Score */}
                    <td className={`py-4 px-6 text-right font-black text-sm ${getScoreColor(r.eco_score)}`}>
                      {r.eco_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

    </div>
  );
};

export default History;
