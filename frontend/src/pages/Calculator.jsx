import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import api from '../api';
import { 
  FaCar, 
  FaBolt, 
  FaUtensils, 
  FaTrashCan,
  FaArrowRight,
  FaCheckDouble,
  FaChevronRight,
  FaPersonWalking,
  FaBicycle,
  FaMotorcycle,
  FaBus,
  FaTrain,
  FaPlane,
  FaTv,
  FaLaptop,
  FaShirt,
  FaFan,
  FaSnowflake,
  FaWineBottle,
  FaBoxOpen,
  FaAppleWhole,
  FaRecycle
} from 'react-icons/fa6';

const Calculator = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transport');
  
  // 1. Transportation state
  const [walk, setWalk] = useState(0);
  const [bicycle, setBicycle] = useState(0);
  const [bike, setBike] = useState(0);
  const [car, setCar] = useState(0);
  const [bus, setBus] = useState(0);
  const [train, setTrain] = useState(0);
  const [flight, setFlight] = useState(0);
  
  // 2. Energy state
  const [electricity, setElectricity] = useState(0);
  const [ac, setAc] = useState(0);
  const [fan, setFan] = useState(0);
  const [refrigerator, setRefrigerator] = useState(true);
  const [washing, setWashing] = useState(0);
  const [tv, setTv] = useState(0);
  const [laptop, setLaptop] = useState(0);
  
  // 3. Food state
  const [veg, setVeg] = useState(0);
  const [nonveg, setNonveg] = useState(0);
  const [dairy, setDairy] = useState(0);
  const [fastfood, setFastfood] = useState(0);
  
  // 4. Waste state
  const [plastic, setPlastic] = useState(0);
  const [paper, setPaper] = useState(0);
  const [foodWaste, setFoodWaste] = useState(0);
  const [recycling, setRecycling] = useState(0);
  
  // Dynamic subtotals & scoring calculations
  const [subtotals, setSubtotals] = useState({
    transport: 0,
    energy: 0,
    food: 0,
    waste: 0,
    total: 0,
    ecoScore: 100
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Recalculate subtotals on every state change to show real-time feedback
  useEffect(() => {
    // 1. Transportation math: Walk:0, Bicycle:0, Bike:0.1, Car:0.2, Bus:0.08, Train:0.04, Flight:0.15
    const tSub = (bike * 0.1) + (car * 0.2) + (bus * 0.08) + (train * 0.04) + (flight * 0.15);
    
    // 2. Energy math: Grid grid baseline ~0.7 kg CO2 / kWh. Refrigerator ~1.5 kWh baseline.
    const refrigKwh = refrigerator ? 1.5 : 0.0;
    const energyKwh = Number(electricity) + (ac * 1.5) + (fan * 0.08) + refrigKwh + (washing * 0.5) + (tv * 0.1) + (laptop * 0.05);
    const eSub = energyKwh * 0.7;
    
    // 3. Food math: Veg:1.2, NonVeg:3.3, Dairy:0.5, FastFood:2.5
    const fSub = (veg * 1.2) + (nonveg * 3.3) + (dairy * 0.5) + (fastfood * 2.5);
    
    // 4. Waste math: Plastic:2.0, Paper:0.5, Food:2.5, Recycling:-0.6
    const wSub = Math.max(0.0, (plastic * 2.0) + (paper * 0.5) + (foodWaste * 2.5) - (recycling * 0.6));
    
    const total = tSub + eSub + fSub + wSub;
    
    // Eco Score math (target ~10 kg CO2/day)
    let ecoScore = 100;
    if (total <= 5) {
      ecoScore = 95.0 + Math.max(0.0, 5.0 - total);
    } else if (total <= 10) {
      ecoScore = 85.0 + (10.0 - total) * 2.0;
    } else if (total <= 20) {
      ecoScore = 65.0 + (20.0 - total) * 2.0;
    } else if (total <= 40) {
      ecoScore = 30.0 + (40.0 - total) * 1.75;
    } else {
      ecoScore = Math.max(5.0, 30.0 - (total - 40.0) * 0.5);
    }
    
    setSubtotals({
      transport: Number(tSub.toFixed(2)),
      energy: Number(eSub.toFixed(2)),
      food: Number(fSub.toFixed(2)),
      waste: Number(wSub.toFixed(2)),
      total: Number(total.toFixed(2)),
      ecoScore: Math.min(100, Number(ecoScore.toFixed(1)))
    });
    
  }, [
    walk, bicycle, bike, car, bus, train, flight,
    electricity, ac, fan, refrigerator, washing, tv, laptop,
    veg, nonveg, dairy, fastfood,
    plastic, paper, foodWaste, recycling
  ]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.post('/carbon/calculate', {
        walk_distance: walk,
        bicycle_distance: bicycle,
        bike_distance: bike,
        car_distance: car,
        bus_distance: bus,
        train_distance: train,
        flight_distance: flight,
        electricity_units: electricity,
        ac_hours: ac,
        fan_hours: fan,
        refrigerator_usage: refrigerator,
        washing_machine_hours: washing,
        tv_hours: tv,
        laptop_hours: laptop,
        veg_meals: veg,
        non_veg_meals: nonveg,
        dairy_consumption: dairy,
        fast_food_consumption: fastfood,
        plastic_waste: plastic,
        paper_waste: paper,
        food_waste: foodWaste,
        recycling_activity: recycling
      });
      
      setResult(res.data);
      refreshUser();
      
      // Scroll to result view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Failed to log carbon details", err);
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    // Reset transport
    setWalk(0); setBicycle(0); setBike(0); setCar(0); setBus(0); setTrain(0); setFlight(0);
    // Reset energy
    setElectricity(0); setAc(0); setFan(0); setRefrigerator(true); setWashing(0); setTv(0); setLaptop(0);
    // Reset food
    setVeg(0); setNonveg(0); setDairy(0); setFastfood(0);
    // Reset waste
    setPlastic(0); setPaper(0); setFoodWaste(0); setRecycling(0);
    
    setResult(null);
  };

  const getScoreRating = (score) => {
    if (score >= 90) return { title: "Climate Hero", color: "text-ecoGreen bg-ecoGreen/10 border-ecoGreen/20" };
    if (score >= 70) return { title: "Green Warrior", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 50) return { title: "Eco Learner", color: "text-ecoCyan bg-ecoCyan/10 border-ecoCyan/20" };
    return { title: "Beginner", color: "text-red-400 bg-red-500/10 border-red-500/20" };
  };

  const tabs = [
    { id: 'transport', name: 'Transportation', icon: FaCar, color: 'text-ecoGreen' },
    { id: 'energy', name: 'Household Energy', icon: FaBolt, color: 'text-yellow-400' },
    { id: 'food', name: 'Food Footprint', icon: FaUtensils, color: 'text-orange-400' },
    { id: 'waste', name: 'Waste & Recycling', icon: FaTrashCan, color: 'text-ecoCyan' },
  ];

  if (result) {
    const rating = getScoreRating(result.record.eco_score);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <GlassCard className="text-center py-10 relative">
          <div className="bg-glow-green -top-24 -left-24 opacity-40 animate-pulse" />
          <div className="bg-glow-cyan -bottom-24 -right-24 opacity-30" />
          
          <div className="inline-flex items-center justify-center p-4 bg-ecoGreen/10 border border-ecoGreen/20 rounded-full mb-4">
            <FaCheckDouble className="w-8 h-8 text-ecoGreen" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Calculation Logged!</h2>
          <p className="text-sm text-zinc-400 mt-2 font-medium">Your sustainability metrics have been recorded securely.</p>
          
          {/* Points earned badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 border border-white/5 shadow-inner">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Points Gained:</span>
            <span className="text-ecoGreen font-extrabold">+{result.points_earned} Eco Points</span>
          </div>

          {/* Badges unlocked alert */}
          {result.badges_earned && result.badges_earned.length > 0 && (
            <div className="mt-4 max-w-sm mx-auto p-4 rounded-2xl bg-ecoGreen/10 border border-ecoGreen/30 text-center space-y-2">
              <p className="text-xs font-bold text-ecoGreen uppercase tracking-widest">🎖️ Badges Earned!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {result.badges_earned.map(b => (
                  <span key={b} className="text-xs bg-zinc-950 px-3 py-1 rounded-xl text-white font-bold border border-white/10">{b}</span>
                ))}
              </div>
            </div>
          )}

          {/* Results split summary */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-center">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Transportation</span>
              <span className="text-lg font-bold text-white mt-1 block">{result.record.transportation_emission} kg</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-center">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Energy Usage</span>
              <span className="text-lg font-bold text-white mt-1 block">{result.record.energy_emission} kg</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-center">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Food Footprint</span>
              <span className="text-lg font-bold text-white mt-1 block">{result.record.food_emission} kg</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 text-center">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Waste & Trash</span>
              <span className="text-lg font-bold text-white mt-1 block">{result.record.waste_emission} kg</span>
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-8 max-w-sm mx-auto flex flex-col items-center gap-4">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Calculated Eco Score:</span>
              <h1 className="text-5xl font-black text-white mt-1 tracking-tight">{result.record.eco_score}/100</h1>
              <span className={`text-xs font-bold border px-3 py-1 rounded-full mt-2 inline-block ${rating.color}`}>
                {rating.title}
              </span>
            </div>

            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={resetCalculator}
                className="flex-1 py-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white text-xs font-extrabold uppercase tracking-wider transition-colors"
              >
                Log New Entry
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 rounded-xl bg-ecoGreen hover:bg-ecoGreen-dark text-black text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Dashboard Hub</span>
                <FaArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Forms inputs panel */}
      <div className="lg:col-span-2 space-y-6">
        <GlassCard className="p-0 overflow-visible">
          {/* Tabs Navigation */}
          <div className="flex border-b border-white/5 bg-zinc-950/40 rounded-t-2xl p-2 gap-1 overflow-x-auto">
            {tabs.map(t => {
              const TabIcon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 shrink-0
                    ${activeTab === t.id 
                      ? 'bg-zinc-900 text-white shadow-sm border border-white/5' 
                      : 'text-zinc-500 hover:text-zinc-300'
                    }
                  `}
                >
                  <TabIcon className={`w-4 h-4 ${activeTab === t.id ? t.color : 'text-zinc-500'}`} />
                  <span>{t.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Tab: Transportation */}
            {activeTab === 'transport' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Daily Travel Distances (km)</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-zinc-300 flex items-center gap-1.5"><FaPersonWalking className="w-3.5 h-3.5 text-zinc-500" /> Walking</span>
                      <span className="text-zinc-400">{walk} km</span>
                    </div>
                    <input type="range" min="0" max="30" value={walk} onChange={(e) => setWalk(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-zinc-300 flex items-center gap-1.5"><FaBicycle className="w-3.5 h-3.5 text-zinc-500" /> Bicycle Riding</span>
                      <span className="text-zinc-400">{bicycle} km</span>
                    </div>
                    <input type="range" min="0" max="50" value={bicycle} onChange={(e) => setBicycle(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-zinc-300 flex items-center gap-1.5"><FaMotorcycle className="w-3.5 h-3.5 text-zinc-500" /> Motorbike Distance</span>
                      <span className="text-zinc-400">{bike} km</span>
                    </div>
                    <input type="range" min="0" max="100" value={bike} onChange={(e) => setBike(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-zinc-300 flex items-center gap-1.5"><FaCar className="w-3.5 h-3.5 text-zinc-500" /> Private Car Drive</span>
                      <span className="text-zinc-400">{car} km</span>
                    </div>
                    <input type="range" min="0" max="200" value={car} onChange={(e) => setCar(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-zinc-300 flex items-center gap-1.5"><FaBus className="w-3.5 h-3.5 text-zinc-500" /> Bus Commute</span>
                      <span className="text-zinc-400">{bus} km</span>
                    </div>
                    <input type="range" min="0" max="100" value={bus} onChange={(e) => setBus(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-zinc-300 flex items-center gap-1.5"><FaTrain className="w-3.5 h-3.5 text-zinc-500" /> Train / Metro Ride</span>
                      <span className="text-zinc-400">{train} km</span>
                    </div>
                    <input type="range" min="0" max="150" value={train} onChange={(e) => setTrain(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-zinc-300 flex items-center gap-1.5"><FaPlane className="w-3.5 h-3.5 text-zinc-500" /> Air Travel (Flights)</span>
                      <span className="text-zinc-400">{flight} km</span>
                    </div>
                    <input type="range" min="0" max="1000" step="10" value={flight} onChange={(e) => setFlight(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Energy */}
            {activeTab === 'energy' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Household Appliances & Utilities</h3>
                
                <div className="space-y-4">
                  {/* Electricity units */}
                  <div>
                    <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mb-1.5">Electricity Usage (daily grid kWh)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={electricity} 
                      onChange={(e) => setElectricity(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>

                  {/* Refrigerator toggle switch */}
                  <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/40 border border-white/5">
                    <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1.5"><FaSnowflake className="w-3.5 h-3.5 text-zinc-500" /> Refrigerator Running (24h)</span>
                    <button
                      type="button"
                      onClick={() => setRefrigerator(!refrigerator)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        refrigerator ? 'bg-ecoGreen text-black shadow-neon-green' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {refrigerator ? 'Active' : 'Standby'}
                    </button>
                  </div>

                  {/* Sliders for appliances */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span className="text-zinc-300 flex items-center gap-1.5"><FaSnowflake className="w-3.5 h-3.5 text-zinc-500" /> AC Runtime</span>
                        <span className="text-zinc-400">{ac} hours</span>
                      </div>
                      <input type="range" min="0" max="24" value={ac} onChange={(e) => setAc(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span className="text-zinc-300 flex items-center gap-1.5"><FaFan className="w-3.5 h-3.5 text-zinc-500" /> Fan Runtime</span>
                        <span className="text-zinc-400">{fan} hours</span>
                      </div>
                      <input type="range" min="0" max="24" value={fan} onChange={(e) => setFan(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span className="text-zinc-300 flex items-center gap-1.5"><FaShirt className="w-3.5 h-3.5 text-zinc-500" /> Washing Machine</span>
                        <span className="text-zinc-400">{washing} hours</span>
                      </div>
                      <input type="range" min="0" max="5" step="0.5" value={washing} onChange={(e) => setWashing(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span className="text-zinc-300 flex items-center gap-1.5"><FaTv className="w-3.5 h-3.5 text-zinc-500" /> Television (TV)</span>
                        <span className="text-zinc-400">{tv} hours</span>
                      </div>
                      <input type="range" min="0" max="12" value={tv} onChange={(e) => setTv(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span className="text-zinc-300 flex items-center gap-1.5"><FaLaptop className="w-3.5 h-3.5 text-zinc-500" /> Laptop Usage</span>
                        <span className="text-zinc-400">{laptop} hours</span>
                      </div>
                      <input type="range" min="0" max="16" value={laptop} onChange={(e) => setLaptop(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-ecoGreen" />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Tab: Food */}
            {activeTab === 'food' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Meals & Dairy Intake</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1.5">Vegetarian Meals (count)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={veg} 
                      onChange={(e) => setVeg(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1.5">Non-Vegetarian Meals (meat/beef count)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={nonveg} 
                      onChange={(e) => setNonveg(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1.5">Dairy Consumption (portions)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={dairy} 
                      onChange={(e) => setDairy(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1.5">Fast Food Meals (count)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={fastfood} 
                      onChange={(e) => setFastfood(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Waste */}
            {activeTab === 'waste' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Waste Generation & Disposal</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1.5 flex items-center gap-1.5"><FaWineBottle className="w-3.5 h-3.5 text-zinc-500" /> Plastic Waste Generated (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      value={plastic} 
                      onChange={(e) => setPlastic(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1.5 flex items-center gap-1.5"><FaBoxOpen className="w-3.5 h-3.5 text-zinc-500" /> Paper/Cardboard Waste (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      value={paper} 
                      onChange={(e) => setPaper(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1.5 flex items-center gap-1.5"><FaAppleWhole className="w-3.5 h-3.5 text-zinc-500" /> Food Waste (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      value={foodWaste} 
                      onChange={(e) => setFoodWaste(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-semibold block mb-1.5 flex items-center gap-1.5"><FaRecycle className="w-3.5 h-3.5 text-ecoGreen" /> Items Sorted for Recycling (count)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={recycling} 
                      onChange={(e) => setRecycling(Math.max(0, Number(e.target.value)))}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white glass-input"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons inside Form */}
            <div className="flex justify-between border-t border-white/5 mt-8 pt-6">
              <button
                type="button"
                onClick={() => {
                  const idx = tabs.findIndex(t => t.id === activeTab);
                  if (idx > 0) setActiveTab(tabs[idx-1].id);
                }}
                disabled={activeTab === 'transport'}
                className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/5 text-zinc-400 hover:text-white text-xs font-bold transition-all disabled:opacity-30"
              >
                Back Section
              </button>
              
              {activeTab !== 'waste' ? (
                <button
                  type="button"
                  onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx+1].id);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/5 text-ecoGreen text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>Next Section</span>
                  <FaChevronRight className="w-2.5 h-2.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ecoGreen to-ecoCyan text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-neon-green"
                >
                  {loading ? "Analyzing..." : "Complete & Log Entry"}
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Real-time Subtotals summary panel */}
      <div className="lg:col-span-1 space-y-6">
        <GlassCard className="sticky top-24 flex flex-col justify-between min-h-[400px]">
          <div className="bg-glow-green -top-20 -right-20 opacity-30" />
          
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Live Subtotals</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase">Transportation:</span>
                <span className="text-white font-bold">{subtotals.transport} kg CO2</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase">Household Energy:</span>
                <span className="text-white font-bold">{subtotals.energy} kg CO2</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase">Food footprint:</span>
                <span className="text-white font-bold">{subtotals.food} kg CO2</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase">Waste Management:</span>
                <span className="text-white font-bold">{subtotals.waste} kg CO2</span>
              </div>
            </div>
            
            <div className="border-t border-white/5 mt-6 pt-6 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Net Daily Footprint:</span>
                <span className="text-3xl font-black text-white mt-1 block">{subtotals.total} <span className="text-xs font-bold text-zinc-400">kg</span></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Predicted Eco Score:</span>
                <span className="text-2xl font-black text-ecoGreen block">{subtotals.ecoScore}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/5 text-[11px] text-zinc-400 leading-relaxed">
              <p className="font-bold text-zinc-300 mb-1">💡 Real-Time Feedback:</p>
              Your footprint is evaluated against a target carbon budget of <b>10kg CO2 per day</b>. Keeping emissions below 5kg earns you the Climate Hero status badge.
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};

export default Calculator;
