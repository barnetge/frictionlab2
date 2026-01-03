
import React from 'react';
import { SimulationParams, ForceMode } from '../types';
import { Play, RotateCcw, Box, FastForward, Timer, Ruler, MousePointerClick, Infinity as InfinityIcon, Eye, EyeOff } from 'lucide-react';

interface ControlsProps {
  params: SimulationParams;
  onParamsChange: (newParams: SimulationParams) => void;
  onStart: () => void;
  onReset: () => void;
  isRunning: boolean;
  isFinished: boolean;
  showForceValues: boolean;
  onToggleShowForceValues: () => void;
  showStaticLimit: boolean;
  onToggleShowStaticLimit: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  params, 
  onParamsChange,
  onStart, 
  onReset, 
  isRunning,
  isFinished,
  showForceValues,
  onToggleShowForceValues,
  showStaticLimit,
  onToggleShowStaticLimit
}) => {

  const handleMassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 1;
    if (val > 1000) val = 1000;
    if (val < 1) val = 1;
    onParamsChange({ ...params, mass: val });
  };

  const handleForceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val > 2000) val = 2000;
    if (val < 0) val = 0;
    onParamsChange({ ...params, appliedForce: val });
  };

  const handleModeChange = (mode: ForceMode) => {
    onParamsChange({ ...params, forceMode: mode });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (val < 0.1) val = 0.1;
    onParamsChange({ ...params, forceDuration: val });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (val < 1) val = 1;
    onParamsChange({ ...params, forceDistanceLimit: val });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
      
      {/* Top Row: Basic Params */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-4 pb-4 border-b border-slate-100">
        
        <div className="flex flex-wrap gap-6 items-center flex-1 w-full">
            {/* Mass Input & Slider */}
            <div className="flex-1 min-w-[200px] max-w-sm">
                <label htmlFor="mass-input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Box size={12} /> Mass</span>
                    <span className="text-[9px] text-slate-400 font-normal">1 - 1000 kg</span>
                </label>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="1"
                        max="1000"
                        step="1"
                        value={params.mass}
                        onChange={handleMassChange}
                        disabled={isRunning}
                        className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                    />
                    <div className="relative">
                        <input
                            id="mass-input"
                            type="number"
                            min="1"
                            max="1000"
                            value={params.mass}
                            onChange={handleMassChange}
                            disabled={isRunning}
                            className="w-20 px-1.5 py-1 bg-white border border-slate-300 rounded text-right text-slate-700 font-mono text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Force Control */}
            <div className="flex-1 min-w-[200px] max-w-sm">
                <label htmlFor="force-input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1"><FastForward size={12} /> Applied Force Strength</span>
                    <span className="text-[9px] text-slate-400 font-normal">0 - 2000 N</span>
                </label>
                
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="0"
                        max="2000"
                        step="10"
                        value={params.appliedForce}
                        onChange={handleForceChange}
                        disabled={isRunning}
                        className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                    />
                    <div className="relative">
                        <input
                            id="force-input"
                            type="number"
                            min="0"
                            max="2000"
                            value={params.appliedForce}
                            onChange={handleForceChange}
                            disabled={isRunning}
                            className="w-20 px-1.5 py-1 bg-white border border-slate-300 rounded text-right text-slate-700 font-mono text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Row: Force Mode Selection AND Action Buttons */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
         
         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">Force Duration:</span>
         
         {/* Buttons */}
         <button 
            onClick={() => handleModeChange('continuous')}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${params.forceMode === 'continuous' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
         >
            <InfinityIcon size={14} /> Continual
         </button>

         <button 
            onClick={() => handleModeChange('impulse')}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${params.forceMode === 'impulse' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
         >
            <MousePointerClick size={14} /> Initial Push
         </button>

         <button 
            onClick={() => handleModeChange('timed')}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${params.forceMode === 'timed' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
         >
            <Timer size={14} /> Custom Time
         </button>

         <button 
            onClick={() => handleModeChange('distance')}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${params.forceMode === 'distance' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
         >
            <Ruler size={14} /> Custom Distance
         </button>

         {/* Conditional Inputs */}
         {params.forceMode === 'timed' && (
             <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                 <input 
                    type="number" 
                    value={params.forceDuration} 
                    onChange={handleDurationChange}
                    min="0.1"
                    step="0.5"
                    disabled={isRunning}
                    className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                 />
                 <span className="text-xs text-slate-500">seconds</span>
             </div>
         )}

         {params.forceMode === 'distance' && (
             <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                 <input 
                    type="number" 
                    value={params.forceDistanceLimit} 
                    onChange={handleDistanceChange}
                    min="1"
                    step="10"
                    disabled={isRunning}
                    className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                 />
                 <span className="text-xs text-slate-500">meters</span>
             </div>
         )}

         {/* Spacer/Divider */}
         <div className="hidden sm:block w-px h-6 bg-slate-100 mx-2"></div>

         {/* Show Force Values Toggle */}
         <button
            onClick={onToggleShowForceValues}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${showForceValues ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            title="Show force magnitudes on diagram"
         >
            {showForceValues ? <Eye size={14} /> : <EyeOff size={14} />}
            {showForceValues ? 'Hide Values' : 'Show Values'}
         </button>

         {/* Show Static Limit Toggle */}
         <button
            onClick={onToggleShowStaticLimit}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${showStaticLimit ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            title="Show maximum static friction limit"
         >
            {showStaticLimit ? <Eye size={14} /> : <EyeOff size={14} />}
            {showStaticLimit ? 'Hide Static Limit' : 'Show Static Limit'}
         </button>

         {/* Action Buttons */}
         <div className="flex gap-2">
            {!isRunning && (
              <button
                onClick={onStart}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-1.5 rounded-lg font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 ${isFinished ? 'bg-indigo-600' : 'bg-indigo-600'} shadow hover:shadow-indigo-200 whitespace-nowrap min-w-[100px]`}
              >
                <Play size={16} fill="currentColor" />
                {isFinished ? 'Restart' : 'Start'}
              </button>
            )}
            
            {(isRunning || isFinished) && (
               <button
                onClick={onReset}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg font-medium text-sm text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap min-w-[100px]"
              >
                <RotateCcw size={16} /> Run Again?
              </button>
            )}
          </div>

      </div>

    </div>
  );
};

export default Controls;
