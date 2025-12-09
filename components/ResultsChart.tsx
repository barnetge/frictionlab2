import React from 'react';
import { SimulationResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Timer, Gauge } from 'lucide-react';

interface ResultsChartProps {
  results: SimulationResult[];
}

const ResultsChart: React.FC<ResultsChartProps> = ({ results }) => {
  const chartData = results.map(r => ({
    name: r.surface,
    time: r.didMove ? (r.finalTime === Infinity ? 0 : Number(r.finalTime.toFixed(2))) : 0,
    velocity: r.didMove ? Number(r.maxVelocity.toFixed(2)) : 0,
    staticLimit: Number(r.staticFrictionLimit.toFixed(1))
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Time Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Timer size={20} className="text-indigo-500" /> Time to 500m (s)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}} 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend />
              <Bar dataKey="time" name="Time (s)" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center italic">*Lower is faster. 0 means it did not finish or start.</p>
      </div>

      {/* Max Velocity Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Gauge size={20} className="text-emerald-500" /> Max Velocity (m/s)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
               <Tooltip 
                cursor={{fill: '#f1f5f9'}} 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend />
              <Bar dataKey="velocity" name="Max Speed (m/s)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
         <p className="text-xs text-slate-500 mt-2 text-center italic">*Higher is faster.</p>
      </div>

    </div>
  );
};

export default ResultsChart;
