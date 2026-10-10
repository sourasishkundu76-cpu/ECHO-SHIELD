export type SafetyStatus = 'SAFE' | 'WARNING' | 'DANGER';

export type ObstacleMaterial = 'metal' | 'wood' | 'plastic' | 'cardboard' | 'foam';

export interface MaterialProperties {
  name: string;
  density: number; // kg/m3
  soundSpeed: number; // m/s inside material
  acousticImpedance: number; // Rayls (approx)
  reflectivity: number; // 0 to 1
  roughness: 'Smooth' | 'Medium' | 'Porous' | 'Fibrous';
  color: string;
  description: string;
}

export interface ZoneThresholds {
  safeDistance: number; // > 50 cm
  warningDistance: number; // 20 - 50 cm
  dangerDistance: number; // < 20 cm
}

export interface TelemetryData {
  timestamp: number;
  actualDistance: number; // cm
  measuredDistance: number; // cm
  timeOfFlight: number; // microseconds (μs)
  servoAngle: number; // degrees (0 to 90 or 180)
  ultrasonicFrequency: number; // 40 kHz
  speedOfSound: number; // m/s
  error: number; // cm (measured - actual)
  percentageError: number; // %
  status: SafetyStatus;
  detected: boolean;
  receivedEchoPower: number; // 0 to 1 (dB / normalized)
}

export interface ExperimentTrial {
  id: string;
  timestamp: string;
  actualDistance: number;
  measuredDistance: number;
  timeOfFlight: number;
  error: number;
  percentageError: number;
  servoAngle: number;
  material: ObstacleMaterial;
  obstacleAngle: number;
  temperature: number;
  status: SafetyStatus;
}

export interface HardwarePinout {
  component: string;
  pin: string;
  arduinoPin: string;
  description: string;
}

export type ActiveTab = 
  | 'home' 
  | 'simulation' 
  | 'scanner' 
  | 'physics-lab' 
  | 'experiment-data' 
  | 'physics-concepts' 
  | 'workflow' 
  | 'hardware' 
  | 'applications' 
  | 'presentation';
