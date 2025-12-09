import React from 'react';
import { SurfaceConfig, SimulationState, SimulationParams, SurfaceType } from '../types';
import { Truck, CheckCircle } from 'lucide-react';

interface TrackProps {
  surface: SurfaceConfig;
  state: SimulationState;
  params: SimulationParams;
  onFrictionChange?: (type: SurfaceType, value: number) => void;
  readOnly?: boolean;
}

const Track: React.FC<TrackProps> = ({ surface, state, params, onFrictionChange, readOnly }) => {
  const progressPercent = Math.min((state.position / params.distance) * 100, 100);

  const handleFrictionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFrictionChange) {
      onFrictionChange(surface.type, parseFloat(e.target.value));
    }
  };

  // Calculate Net Force based on dynamic state
  // Use state.currentAppliedForce which might be 0 if force stopped
  let netForce = 0;
  if (state.status === 'moving') {
    netForce = state.currentAppliedForce - state.frictionForce;
  } else if (state.status === 'static') {
    netForce = 0;
  }

  // Visualization scales
  const MAX_ARROW_LEN = 60; // Slightly larger max length
  const FORCE_SCALE = 0.04; // 100N = 4px, 1000N = 40px, 1500N = 60px (maxed)
  
  // Use currentAppliedForce for the arrow length
  const fAppLen = Math.min(state.currentAppliedForce * FORCE_SCALE, MAX_ARROW_LEN);
  const fFricLen = Math.min(state.frictionForce * FORCE_SCALE, MAX_ARROW_LEN);
  
  // Fixed length for vertical forces as they are schematic in this 1D simulation
  const fNormLen = 20;
  const fGravLen = 20;

  return (
    <div className="flex h-32 mb-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* LEFT: Track Visualization (Flexible Width) */}
      <div className={`relative flex-1 ${surface.color} bg-opacity-20`}>
         {/* Inner container with padding for truck - Increased padding for arrows */}
         <div className="absolute inset-0 px-16 flex items-center">
            {/* Track Line */}
            <div className="relative w-full h-full">
                <div className="absolute top-1/2 left-0 w-full border-b border-slate-400/20 transform -translate-y-1/2"></div>
                
                {/* Distance markers */}
                <div className="absolute inset-0 pointer-events-none">
                    {[0, 100, 200, 300, 400, 500].map((d) => (
                    <div key={d} className="absolute h-full border-l border-slate-500/10 text-[9px] text-slate-500 pt-1 pl-0.5" style={{ left: `${(d / 500) * 100}%` }}>
                        {d}m
                    </div>
                    ))}
                </div>

                {/* The Object */}
                <div 
                className="absolute transform -translate-x-1/2 transition-transform duration-75 ease-linear will-change-transform flex flex-col items-center z-10 top-1/2 -translate-y-1/2"
                style={{ left: `${progressPercent}%` }}
                >
                    <div className="relative group w-fit">
                        {/* Block */}
                        <div className={`relative z-20 w-14 h-10 bg-white border-2 rounded-lg shadow-sm flex flex-col items-center justify-center transition-colors ${
                        state.status === 'finished' ? 'border-green-500 text-green-500' : 
                        state.status === 'moving' ? 'border-indigo-600 text-indigo-600' : 'border-slate-400 text-slate-400'
                        }`}>
                            {state.status === 'finished' ? <CheckCircle size={14} /> : <Truck size={14} />}
                            <span className="text-[10px] font-bold leading-none mt-0.5">{params.mass}kg</span>
                        </div>
                        
                        {/* Vector Diagram SVG Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] pointer-events-none z-10 flex items-center justify-center">
                            <svg width="200" height="200" viewBox="0 0 200 200" className="overflow-visible">
                                <defs>
                                    <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                        <path d="M0,0 L0,6 L6,3 z" fill="#22c55e" />
                                    </marker>
                                    <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                        <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
                                    </marker>
                                    <marker id="arrow-slate" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                        <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
                                    </marker>
                                </defs>
                                
                                {/* Fn (Up) */}
                                <line x1="100" y1="80" x2="100" y2={80 - fNormLen} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow-slate)" />
                                <text x="105" y={80 - fNormLen} fontSize="9" fill="#64748b" className="font-mono">Fn</text>

                                {/* Fg (Down) */}
                                <line x1="100" y1="120" x2="100" y2={120 + fGravLen} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow-slate)" />
                                <text x="105" y={120 + fGravLen + 8} fontSize="9" fill="#64748b" className="font-mono">mg</text>

                                {/* Applied Force (Right) - Only show if currentAppliedForce > 0 */}
                                {state.currentAppliedForce > 0 && (
                                    <line x1="128" y1="100" x2={128 + fAppLen} y2="100" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrow-green)" />
                                )}

                                {/* Friction Force (Left) */}
                                {state.frictionForce > 0 && (
                                    <line x1="72" y1="100" x2={72 - fFricLen} y2="100" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
                                )}
                            </svg>
                        </div>
                    </div>
                    
                    {/* Time below truck */}
                    <div className="mt-8 text-[9px] font-mono text-slate-500">
                        {state.timeElapsed.toFixed(1)}s
                    </div>
                </div>
            </div>
         </div>
         
         {/* Status Tag for Static */}
         {state.status === 'static' && params.appliedForce > 0 && state.currentAppliedForce > 0 && (
            <div className="absolute top-2 right-2">
                <span className="text-[10px] font-bold text-red-500 bg-white/80 px-2 py-0.5 rounded border border-red-100">
                    Friction Force is too strong
                </span>
            </div>
         )}
         {state.velocity === 0 && state.timeElapsed > 0 && state.position > 0 && state.currentAppliedForce === 0 && !state.isFinished && (
            <div className="absolute top-2 right-2">
                <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                    Stopped (Friction)
                </span>
            </div>
         )}
      </div>

      {/* RIGHT: Compact Dashboard & Controls (Fixed Width) */}
      <div className="w-72 bg-white border-l border-slate-100 flex divide-x divide-slate-100">
          
          {/* Stats Column */}
          <div className="flex-1 p-3 flex flex-col justify-between">
              {/* Title */}
              <div className="flex items-center gap-1.5 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${surface.type === 'Ice' ? 'bg-cyan-500' : surface.type === 'Normal' ? 'bg-slate-500' : 'bg-orange-500'}`}></span>
                  <h3 className="font-bold text-sm text-slate-700">{surface.type}</h3>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">Speed</span>
                      <span className="text-sm font-mono font-medium text-indigo-600">{state.velocity.toFixed(1)} <span className="text-[9px] text-slate-400">m/s</span></span>
                  </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">Acc</span>
                      <span className="text-sm font-mono font-medium text-slate-600">{state.acceleration.toFixed(1)} <span className="text-[9px] text-slate-400">m/s²</span></span>
                  </div>
                  <div className="flex flex-col col-span-2 mt-1 pt-1 border-t border-slate-50">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">Net Force</span>
                      <span className={`text-sm font-mono font-bold ${netForce > 0 ? 'text-green-600' : netForce < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                          {netForce.toFixed(1)} N
                      </span>
                  </div>
              </div>
          </div>

          {/* Slider Column (Vertical) */}
          <div className="w-16 bg-slate-50 flex flex-col items-center justify-between py-2 relative">
             <label htmlFor={`slider-${surface.type}`} className="text-[10px] font-bold text-slate-500">μK</label>
             
             <div className="flex-1 w-full flex items-center justify-center relative min-h-[60px]">
                {/* Vertical Slider transform */}
                <input 
                    id={`slider-${surface.type}`}
                    type="range" 
                    min={surface.frictionRange[0]} 
                    max={surface.frictionRange[1]} 
                    step="0.01"
                    value={surface.kineticFrictionCoeff}
                    onChange={handleFrictionChange}
                    disabled={readOnly}
                    className="absolute h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600 origin-center -rotate-90 hover:bg-slate-400 transition-colors"
                    style={{ width: '60px' }} 
                 />
             </div>
             
             <span className="text-xs font-mono font-bold text-slate-700">{surface.kineticFrictionCoeff.toFixed(2)}</span>
          </div>

      </div>
    </div>
  );
};

export default Track;