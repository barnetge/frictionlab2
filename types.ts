
export enum SurfaceType {
  ICE = 'Ice',
  NORMAL = 'Floor',
  ROUGH = 'Rough (like Sandpaper)'
}

export type ForceMode = 'continuous' | 'impulse' | 'timed' | 'distance';

export interface SurfaceConfig {
  type: SurfaceType;
  staticFrictionCoeff: number; // mu_s
  kineticFrictionCoeff: number; // mu_k
  frictionRange: [number, number]; // [min, max] for kinetic friction
  color: string;
  description: string;
}

export interface SimulationState {
  id: SurfaceType;
  position: number; // meters
  velocity: number; // m/s
  acceleration: number; // m/s^2
  timeElapsed: number; // seconds
  isFinished: boolean;
  status: 'static' | 'moving' | 'finished';
  frictionForce: number; // Newtons
  currentAppliedForce: number; // Newtons (actual force applied in this frame)
}

export interface SimulationParams {
  mass: number; // kg
  distance: number; // meters
  appliedForce: number; // Newtons (Global)
  forceMode: ForceMode;
  forceDuration: number; // seconds
  forceDistanceLimit: number; // meters
}

export interface SimulationResult {
  surface: SurfaceType;
  finalTime: number; // seconds, Infinity if it didn't move
  maxVelocity: number;
  didMove: boolean;
  staticFrictionLimit: number;
  appliedForce: number;
  forceMode: ForceMode;
}
