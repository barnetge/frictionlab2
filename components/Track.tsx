
import React from 'react';
import { SurfaceConfig, SimulationState, SimulationParams, SurfaceType } from '../types';
import { CheckCircle } from 'lucide-react';

interface TrackProps {
  surface: SurfaceConfig;
  state: SimulationState;
  params: SimulationParams;
  onFrictionChange?: (type: SurfaceType, value: number) => void;
  readOnly?: boolean;
  showForceValues?: boolean;
  showStaticLimit?: boolean;
}

const Track: React.FC<TrackProps> = ({ surface, state, params, onFrictionChange, readOnly, showForceValues, showStaticLimit }) => {
  // Use a visual range to avoid clipping at edges (car width + vectors)
  const VISUAL_PADDING_PERCENT = 15; // 15% padding on each side
  const VISUAL_WIDTH_PERCENT = 100 - (VISUAL_PADDING_PERCENT * 2);
  
  const progressFraction = Math.min(state.position / params.distance, 1);
  const visualLeft = VISUAL_PADDING_PERCENT + (progressFraction * VISUAL_WIDTH_PERCENT);

  const handleFrictionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFrictionChange) {
      onFrictionChange(surface.type, parseFloat(e.target.value));
    }
  };

  // Adaptive Force Scaling Function
  const getScaledLength = (f: number) => {
    if (f === 0) return 0;
    const absF = Math.abs(f);
    return Math.log10(absF + 1) * 15;
  };

  // Calculate Forces
  const normalForce = params.mass * 9.81;
  const fStaticMax = surface.staticFrictionCoeff * normalForce;
  const appForce = state.currentAppliedForce;

  // Face Logic: Determine emotion based on force comparison
  let emotion: 'idle' | 'happy' | 'sad' | 'neutral' | 'ecstatic' = 'idle';
  
  if (state.status === 'finished') {
    emotion = 'ecstatic';
  } else if (appForce > 0) {
    if (appForce > fStaticMax + 0.1) {
      emotion = 'happy';
    } else if (Math.abs(appForce - fStaticMax) <= 0.1) {
      emotion = 'neutral';
    } else {
      emotion = 'sad';
    }
  }

  // Calculate Net Force based on dynamic state
  let netForce = 0;
  if (state.status === 'moving') {
    netForce = state.currentAppliedForce - state.frictionForce;
  } else if (state.status === 'static') {
    netForce = 0;
  }

  const fAppLen = getScaledLength(state.currentAppliedForce);
  const fFricLen = getScaledLength(state.frictionForce);
  const fStaticMaxLen = getScaledLength(fStaticMax);
  const fNormLen = getScaledLength(normalForce);
  const fGravLen = fNormLen;

  // Format values for display
  const normalVal = normalForce.toFixed(1);
  const gravVal = normalForce.toFixed(1);
  const appVal = state.currentAppliedForce.toFixed(0);
  const fricVal = state.frictionForce.toFixed(1);
  const staticMaxVal = fStaticMax.toFixed(1);

  // Helper for color indicator mapping to new names
  const getIndicatorColor = (type: SurfaceType) => {
    switch (type) {
      case SurfaceType.ICE: return 'bg-cyan-500';
      case SurfaceType.NORMAL: return 'bg-slate-500';
      case SurfaceType.ROUGH: return 'bg-orange-500';
      default: return 'bg-indigo-500';
    }
  };

  return (
    <div className="flex h-36 mb-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* LEFT: Track Visualization */}
      <div className={`relative flex-1 ${surface.color} bg-opacity-20`}>
         
         <div className="absolute inset-0 flex items-center">
            <div className="relative w-full h-full">
                {/* Track Surface Line with padding */}
                <div 
                  className="absolute top-1/2 border-b-2 border-slate-400/30 transform -translate-y-1/2"
                  style={{ left: `${VISUAL_PADDING_PERCENT}%`, right: `${VISUAL_PADDING_PERCENT}%` }}
                ></div>
                
                {/* Distance markers aligned with padded track */}
                <div className="absolute inset-0 pointer-events-none">
                    {[0, 100, 200, 300, 400, 500].map((d) => (
                    <div 
                      key={d} 
                      className="absolute h-full border-l border-slate-500/10 text-[9px] text-slate-500 pt-1 pl-0.5" 
                      style={{ left: `${VISUAL_PADDING_PERCENT + (d / 500) * VISUAL_WIDTH_PERCENT}%` }}
                    >
                        {d}m
                    </div>
                    ))}
                </div>

                {/* The Object */}
                <div 
                  className="absolute transform -translate-x-1/2 transition-transform duration-75 ease-linear will-change-transform flex flex-col items-center z-10 top-1/2 -translate-y-1/2"
                  style={{ left: `${visualLeft}%` }}
                >
                    <div className="relative group w-fit">
                        {/* Expressive Block Character */}
                        <div className="relative z-20 filter drop-shadow-md pb-1">
                            <div className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-b-4 transition-all duration-300 ${
                                emotion === 'ecstatic' 
                                    ? 'bg-emerald-400 border-emerald-600 scale-110' 
                                    : emotion === 'sad' ? 'bg-rose-400 border-rose-600' : 'bg-violet-500 border-violet-700'
                            }`}>
                                {/* Eyes */}
                                <div className="flex gap-4 mb-2">
                                    <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                                        <div className={`absolute w-1.5 h-1.5 bg-slate-900 rounded-full transition-all duration-300 ${
                                          emotion === 'happy' || emotion === 'ecstatic' ? 'translate-y-[-1px]' : 
                                          emotion === 'sad' ? 'translate-y-[1px]' : ''
                                        }`}></div>
                                    </div>
                                    <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center relative overflow-hidden">
                                        <div className={`absolute w-1.5 h-1.5 bg-slate-900 rounded-full transition-all duration-300 ${
                                          emotion === 'happy' || emotion === 'ecstatic' ? 'translate-y-[-1px]' : 
                                          emotion === 'sad' ? 'translate-y-[1px]' : ''
                                        }`}></div>
                                    </div>
                                </div>
                                
                                {/* Mouth: Dynamic based on emotion */}
                                <div className="relative h-3 flex items-center justify-center">
                                  {emotion === 'idle' && (
                                    <div className="w-3 h-1 bg-slate-900/20 rounded-full"></div>
                                  )}
                                  {emotion === 'happy' && (
                                    <div className="w-4 h-2 border-b-2 border-slate-900 rounded-full"></div>
                                  )}
                                  {emotion === 'sad' && (
                                    <div className="w-4 h-2 border-t-2 border-slate-900 rounded-full translate-y-1"></div>
                                  )}
                                  {emotion === 'neutral' && (
                                    <div className="w-4 h-0.5 bg-slate-900 rounded-full"></div>
                                  )}
                                  {emotion === 'ecstatic' && (
                                    <div className="w-3 h-3 bg-white/40 rounded-full border border-emerald-600/20"></div>
                                  )}
                                </div>

                                {/* Mass Text */}
                                <span className="relative z-10 text-[10px] font-black text-white/95 mt-1">{params.mass}kg</span>

                                {state.status === 'finished' && (
                                    <div className="absolute -top-3 -right-3 text-emerald-600 bg-white rounded-full p-0.5 shadow-sm border-2 border-emerald-100 z-30 animate-bounce">
                                        <CheckCircle size={18} fill="currentColor" className="text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Vector Diagram SVG Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[220px] pointer-events-none z-10 flex items-center justify-center">
                            <svg width="280" height="220" viewBox="0 0 280 220" className="overflow-visible">
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
                                
                                <line x1="140" y1="80" x2="140" y2={80 - fNormLen} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow-slate)" />
                                <text x="145" y={80 - fNormLen} fontSize="9" fill="#64748b" className="font-mono">
                                    Fn{showForceValues ? `=${normalVal}N` : ''}
                                </text>

                                <line x1="140" y1="140" x2="140" y2={140 + fGravLen} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow-slate)" />
                                <text x="145" y={140 + fGravLen + 8} fontSize="9" fill="#64748b" className="font-mono">
                                    mg{showForceValues ? `=${gravVal}N` : ''}
                                </text>

                                {state.currentAppliedForce > 0 && (
                                    <>
                                        <line x1="175" y1="110" x2={175 + fAppLen} y2="110" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrow-green)" />
                                        {showForceValues && (
                                           <text x={175 + fAppLen/2} y="105" fontSize="9" fill="#22c55e" textAnchor="middle" className="font-mono font-bold">
                                               Fa={appVal}N
                                           </text>
                                        )}
                                    </>
                                )}

                                {state.frictionForce > 0 && (
                                    <>
                                        <line x1="105" y1="110" x2={105 - fFricLen} y2="110" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
                                        {showForceValues && (
                                            <text x={105 - fFricLen/2} y="105" fontSize="9" fill="#ef4444" textAnchor="middle" className="font-mono font-bold">
                                                Ff={fricVal}N
                                            </text>
                                        )}
                                    </>
                                )}

                                {showStaticLimit && (
                                    <g className="opacity-40">
                                        <line 
                                          x1="105" y1="120" 
                                          x2={105 - fStaticMaxLen} y2="120" 
                                          stroke="#ef4444" 
                                          strokeWidth="1.5" 
                                          strokeDasharray="3 2" 
                                          markerEnd="url(#arrow-red)" 
                                        />
                                        <text x={105 - fStaticMaxLen} y="115" fontSize="8" fill="#ef4444" textAnchor="end" className="font-mono">
                                          fs,max{showForceValues ? `=${staticMaxVal}N` : ''}
                                        </text>
                                    </g>
                                )}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* RIGHT: Dashboard & Controls */}
      <div className="w-72 bg-white border-l border-slate-100 flex divide-x divide-slate-100">
          
          <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${getIndicatorColor(surface.type)}`}></span>
                  <h3 className="font-bold text-xs text-slate-700 truncate">{surface.type}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">Velocity</span>
                      <span className="text-sm font-mono font-bold text-indigo-600">{state.velocity.toFixed(1)} <span className="text-[9px] font-normal">m/s</span></span>
                  </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">Accel</span>
                      <span className="text-sm font-mono font-bold text-slate-600">{state.acceleration.toFixed(1)} <span className="text-[9px] font-normal">m/s²</span></span>
                  </div>
                  <div className="flex flex-col col-span-2 mt-2 pt-2 border-t border-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">Friction (fs/fk)</span>
                        <span className="text-xs font-mono font-bold text-rose-500">{fricVal}N</span>
                      </div>
                      <div className="flex justify-between items-center mt-0.5">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">Net Force</span>
                        <span className={`text-xs font-mono font-bold ${netForce > 0.1 ? 'text-green-600' : 'text-slate-400'}`}>
                            {netForce.toFixed(1)} N
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-0.5 pt-1 border-t border-slate-50/50">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">Coeffs (μs / μk)</span>
                        <span className="text-[10px] font-mono font-bold text-indigo-600">
                            {surface.staticFrictionCoeff.toFixed(2)} / {surface.kineticFrictionCoeff.toFixed(2)}
                        </span>
                      </div>
                  </div>
              </div>
          </div>

          <div className="w-16 bg-slate-50 flex flex-col items-center justify-between py-3 relative shrink-0">
             <label htmlFor={`slider-${surface.type}`} className="text-[10px] font-bold text-slate-500">μk</label>
             <div className="flex-1 w-full flex items-center justify-center relative">
                <input 
                    id={`slider-${surface.type}`}
                    type="range" 
                    min={surface.frictionRange[0]} 
                    max={surface.frictionRange[1]} 
                    step="0.01"
                    value={surface.kineticFrictionCoeff}
                    onChange={handleFrictionChange}
                    disabled={readOnly}
                    className="absolute h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600 origin-center -rotate-90"
                    style={{ width: '80px' }} 
                 />
             </div>
             <span className="text-[11px] font-mono font-bold text-indigo-600">{surface.kineticFrictionCoeff.toFixed(2)}</span>
          </div>

      </div>
    </div>
  );
};

export default Track;
