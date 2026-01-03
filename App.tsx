import React, { useState, useEffect, useRef } from 'react';
import { SimulationParams, SimulationState, SurfaceConfig, SimulationResult, SurfaceType } from './types';
import { SURFACES, INITIAL_PARAMS, GRAVITY } from './constants';
import Controls from './components/Controls';
import Track from './components/Track';
import ResultsChart from './components/ResultsChart';
import AIInsights from './components/AIInsights';
import { Beaker } from 'lucide-react';

// Time step for simulation loop (seconds)
const DT = 0.016; // ~60 FPS
const SPEED_MULTIPLIER = 5; // Speed up the simulation visually
const IMPULSE_DURATION = 0.5; // Seconds for the "Initial Push" option

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(INITIAL_PARAMS);
  const [surfaceConfigs, setSurfaceConfigs] = useState<SurfaceConfig[]>(SURFACES);
  const [states, setStates] = useState<SimulationState[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showForceValues, setShowForceValues] = useState(false);
  const [showStaticLimit, setShowStaticLimit] = useState(false);
  
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Initialize states
  useEffect(() => {
    resetSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const resetSimulation = (currentParams: SimulationParams = params) => {
    const initialStates: SimulationState[] = surfaceConfigs.map(s => ({
      id: s.type,
      position: 0,
      velocity: 0,
      acceleration: 0,
      timeElapsed: 0,
      isFinished: false,
      status: 'static',
      frictionForce: 0,
      currentAppliedForce: currentParams.appliedForce // Initialize with current applied force
    }));
    setStates(initialStates);
    setIsRunning(false);
    setIsFinished(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  // Re-run reset if surfaces change while not running to show updated static limits
  useEffect(() => {
    if (!isRunning && !isFinished) {
      resetSimulation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surfaceConfigs]); 

  const handleStart = () => {
    if (isFinished) {
      resetSimulation();
      // Wait for state update before starting
      setTimeout(() => startLoop(), 0);
    } else {
      startLoop();
    }
  };

  const handleFrictionChange = (type: SurfaceType, newKinetic: number) => {
    setSurfaceConfigs(prev => prev.map(s => {
      if (s.type === type) {
        return {
          ...s,
          kineticFrictionCoeff: newKinetic,
          // Enforce static friction is always 0.1 greater than kinetic
          staticFrictionCoeff: parseFloat((newKinetic + 0.1).toFixed(2))
        };
      }
      return s;
    }));
  };

  const startLoop = () => {
    setIsRunning(true);
    setIsFinished(false);
    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(loop);
  };

  const loop = (time: number) => {
    const deltaTime = (time - lastTimeRef.current) / 1000; // Real seconds elapsed
    lastTimeRef.current = time;

    const simStep = deltaTime * SPEED_MULTIPLIER;

    setStates(prevStates => {
      let allFinished = true;
      
      const newStates = prevStates.map(state => {
        if (state.isFinished) return state;

        // Use the current configuration from state, not the constant
        const surface = surfaceConfigs.find(s => s.type === state.id)!;
        const normalForce = params.mass * GRAVITY;
        const maxStaticFriction = surface.staticFrictionCoeff * normalForce;
        const kineticFriction = surface.kineticFrictionCoeff * normalForce;

        // DETERMINE APPLIED FORCE BASED ON MODE
        let isForceActive = false;
        switch (params.forceMode) {
          case 'continuous':
            isForceActive = true;
            break;
          case 'impulse':
            isForceActive = state.timeElapsed < IMPULSE_DURATION;
            break;
          case 'timed':
            isForceActive = state.timeElapsed < params.forceDuration;
            break;
          case 'distance':
            isForceActive = state.position < params.forceDistanceLimit;
            break;
        }

        const pushForce = isForceActive ? params.appliedForce : 0;

        let newStatus = state.status;
        let newAcc = 0;
        let newVel = state.velocity;
        let newPos = state.position;
        let newTime = state.timeElapsed;
        let currentFriction = 0;

        // Check if it can move
        if (state.status === 'static') {
          // If in static state, time doesn't increment in this model logic until it starts moving,
          // OR we treat it as t=0 check. 
          // However, if force is "Initial Push", it should apply at t=0.
          
          if (pushForce > maxStaticFriction) {
            newStatus = 'moving';
            currentFriction = kineticFriction;
          } else {
            // Stuck
            newStatus = 'static';
            currentFriction = pushForce; // Resists equally up to static limit
            // Note: If force stops (e.g. Impulse ends but it never moved), pushForce becomes 0.
            if (pushForce === 0) {
               currentFriction = 0;
            }
            allFinished = false; 
          }
        } else if (state.status === 'moving') {
          currentFriction = kineticFriction;
          
          // F_net = F_push - F_friction
          // Note: If pushForce is 0, Net Force is negative (only friction), slowing it down.
          const netForce = pushForce - kineticFriction;
          newAcc = netForce / params.mass;

          // Update physics
          newVel += newAcc * simStep;
          
          // Check for stop if velocity drops to 0 (or below due to discrete step)
          if (newVel <= 0 && pushForce <= kineticFriction) {
             newVel = 0;
             newAcc = 0;
             // If force is still pushing but less than kinetic friction? (Rare with this model, usually push > static > kinetic)
             // But if pushForce turned OFF, then yes, it stops.
             newStatus = 'finished'; // Or should it go back to static? For this track sim, 'finished' usually means "done with run"
             // But if it stopped in the middle of track:
             // Let's mark it as 'finished' for simulation purposes if it stops moving mid-track.
             // Or we can keep it 'static' but at new pos?
             // To simplify "Race" logic, if it stops moving, it's done.
          }

          newPos += newVel * simStep;
          newTime += simStep;

          if (newPos >= params.distance) {
            newPos = params.distance;
            newStatus = 'finished';
          } else {
            allFinished = false;
          }
        } else {
           // Finished
           currentFriction = 0;
        }

        return {
          ...state,
          status: newStatus,
          acceleration: newAcc,
          velocity: newVel,
          position: newPos,
          timeElapsed: newTime,
          isFinished: newStatus === 'finished',
          frictionForce: currentFriction,
          currentAppliedForce: pushForce
        };
      });

      // Stop condition
      const currentlyMoving = newStates.some(s => s.status === 'moving');
      
      if (!currentlyMoving && isRunning) {
        setIsFinished(true);
        setIsRunning(false);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } else {
        animationRef.current = requestAnimationFrame(loop);
      }

      return newStates;
    });
  };

  // Compute results for charts/AI
  const results: SimulationResult[] = states.map(state => {
    const surface = surfaceConfigs.find(s => s.type === state.id)!;
    const normalForce = params.mass * GRAVITY;
    return {
      surface: state.id,
      finalTime: state.isFinished ? state.timeElapsed : Infinity,
      maxVelocity: state.velocity, // Note: This is current velocity at end, might be 0 if it stopped. ideally we track maxVel separately.
      didMove: state.position > 0,
      staticFrictionLimit: surface.staticFrictionCoeff * normalForce,
      appliedForce: params.appliedForce,
      forceMode: params.forceMode
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Beaker className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">FrictionLab <span className="text-slate-400 font-normal hidden sm:inline">| Interactive Physics</span></h1>
          </div>
          <div className="text-sm text-slate-500 font-medium">
             Distance: {params.distance}m
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Controls 
          params={params}
          onParamsChange={(p) => { setParams(p); resetSimulation(p); }}
          onStart={handleStart}
          onReset={() => resetSimulation()}
          isRunning={isRunning}
          isFinished={isFinished}
          showForceValues={showForceValues}
          onToggleShowForceValues={() => setShowForceValues(prev => !prev)}
          showStaticLimit={showStaticLimit}
          onToggleShowStaticLimit={() => setShowStaticLimit(prev => !prev)}
        />

        {/* Tracks */}
        <div className="space-y-4 mb-8">
           <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Simulation Tracks</h2>
           {surfaceConfigs.map((surface) => {
             const state = states.find(s => s.id === surface.type);
             if (!state) return null;
             return (
               <Track 
                  key={surface.type} 
                  surface={surface} 
                  state={state} 
                  params={params}
                  onFrictionChange={handleFrictionChange}
                  readOnly={isRunning}
                  showForceValues={showForceValues}
                  showStaticLimit={showStaticLimit}
               />
             );
           })}
        </div>

        {/* Results */}
        {isFinished && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Simulation Results</h2>
              <ResultsChart results={results} />
              
              <AIInsights 
                params={params} 
                results={results} 
                canGenerate={true} 
              />
           </div>
        )}

      </main>
    </div>
  );
};

export default App;