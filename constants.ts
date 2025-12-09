import { SurfaceConfig, SurfaceType, ForceMode } from './types';

export const GRAVITY = 9.81; // m/s^2

export const SURFACES: SurfaceConfig[] = [
  {
    type: SurfaceType.ICE,
    staticFrictionCoeff: 0.15, // Default static (slightly > kinetic)
    kineticFrictionCoeff: 0.1, // Default kinetic (start of range)
    frictionRange: [0.1, 0.3],
    color: 'bg-cyan-200 border-cyan-400',
    description: 'Very smooth surface with minimal resistance.'
  },
  {
    type: SurfaceType.NORMAL,
    staticFrictionCoeff: 0.4,
    kineticFrictionCoeff: 0.3,
    frictionRange: [0.3, 0.6],
    color: 'bg-slate-300 border-slate-500',
    description: 'Standard surface like wood or concrete.'
  },
  {
    type: SurfaceType.ROUGH,
    staticFrictionCoeff: 0.7,
    kineticFrictionCoeff: 0.6,
    frictionRange: [0.6, 1.0],
    color: 'bg-orange-200 border-orange-500',
    description: 'High friction surface like sandpaper or rubber.'
  }
];

export const INITIAL_PARAMS = {
  mass: 1, // kg
  distance: 500, // m
  appliedForce: 150, // N
  forceMode: 'continuous' as ForceMode,
  forceDuration: 5.0, // s
  forceDistanceLimit: 100 // m
};
