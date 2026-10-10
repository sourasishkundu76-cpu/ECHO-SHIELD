import { MaterialProperties, ObstacleMaterial, SafetyStatus, ZoneThresholds } from '../types';

export const MATERIALS_DATA: Record<ObstacleMaterial, MaterialProperties> = {
  metal: {
    name: 'Aluminum / Sheet Steel',
    density: 2700,
    soundSpeed: 5000,
    acousticImpedance: 13.5e6,
    reflectivity: 0.98,
    roughness: 'Smooth',
    color: '#94a3b8',
    description: 'Extremely high acoustic impedance mismatch with air (Z_air ≈ 415 Rayls). Near-total specular reflection of 40 kHz sound waves.'
  },
  plastic: {
    name: 'Rigid ABS / PVC',
    density: 1040,
    soundSpeed: 2300,
    acousticImpedance: 2.4e6,
    reflectivity: 0.92,
    roughness: 'Smooth',
    color: '#38bdf8',
    description: 'High surface reflectivity. Excellent echo return with minimal absorption, typical of standard model train carriages.'
  },
  wood: {
    name: 'Hardwood / Plywood',
    density: 700,
    soundSpeed: 4000,
    acousticImpedance: 2.8e6,
    reflectivity: 0.86,
    roughness: 'Medium',
    color: '#fbbf24',
    description: 'Good specular reflection. Moderate surface roughness scatters a minor portion of the 40 kHz acoustic wavefront.'
  },
  cardboard: {
    name: 'Corrugated Cardboard',
    density: 250,
    soundSpeed: 1500,
    acousticImpedance: 3.7e5,
    reflectivity: 0.78,
    roughness: 'Medium',
    color: '#d97706',
    description: 'Slight acoustic absorption due to porous fibrous surface, but provides easily detectable echo for distances < 2 meters.'
  },
  foam: {
    name: 'Acoustic / Polyurethane Foam',
    density: 30,
    soundSpeed: 300,
    acousticImpedance: 9e3,
    reflectivity: 0.32,
    roughness: 'Porous',
    color: '#64748b',
    description: 'High sound absorption through viscous pore damping. Reflected echo is significantly attenuated at 40 kHz.'
  }
};

/**
 * Calculates theoretical speed of sound in air as a function of temperature (°C).
 * v = 331.3 * sqrt(1 + T / 273.15) ≈ 331.3 + 0.606 * T (m/s)
 */
export function calculateSpeedOfSound(temperatureC: number): number {
  return 331.3 * Math.sqrt(1 + temperatureC / 273.15);
}

/**
 * Calculates ideal Time of Flight (in microseconds) for a given distance (in cm)
 * and speed of sound (in m/s).
 * Round trip: t = (2 * d) / v
 */
export function calculateTimeOfFlight(distanceCm: number, speedOfSoundMs: number): number {
  if (distanceCm <= 0) return 0;
  // d in meters = distanceCm / 100
  // t in seconds = (2 * d_meters) / speedOfSoundMs
  // t in microseconds = t_seconds * 1,000,000
  const distanceM = distanceCm / 100;
  const timeSeconds = (2 * distanceM) / speedOfSoundMs;
  return timeSeconds * 1e6;
}

/**
 * Calculates distance from Time of Flight (μs) and speed of sound (m/s).
 * d = (v * t) / 2
 */
export function calculateDistanceFromToF(timeOfFlightUs: number, speedOfSoundMs: number): number {
  const timeSeconds = timeOfFlightUs / 1e6;
  const distanceM = (speedOfSoundMs * timeSeconds) / 2;
  return distanceM * 100; // in cm
}

/**
 * Simulates the physical HC-SR04 sensor reading with beam cone, orientation, material, and noise.
 */
export function simulateHCSR04Reading(
  actualDistanceCm: number,
  servoAngleDeg: number,
  obstacleAngleDeg: number,
  material: ObstacleMaterial,
  speedOfSoundMs: number,
  addNoise: boolean = true
): {
  measuredDistance: number;
  timeOfFlight: number;
  detected: boolean;
  echoPower: number;
  error: number;
  percentageError: number;
} {
  const mat = MATERIALS_DATA[material];
  
  // Angle difference between sensor heading (servoAngleDeg) and obstacle position
  // HC-SR04 has an effective beam width of approximately ~15 degrees (+/- 7.5 deg)
  const BEAM_HALF_ANGLE = 15; // degrees
  const angleOffset = Math.abs(servoAngleDeg - 45); // assuming track center is at 45 deg or direct bore
  
  // Target orientation angle relative to incident beam
  // Specular reflection: if obstacle is angled > 35 deg relative to incident beam, echo bounces away
  const incidentAngle = Math.abs(obstacleAngleDeg);
  
  // Reflection attenuation factor based on target tilt (Fresnel / specular reflection law)
  const orientationFactor = Math.max(0, Math.cos((incidentAngle * Math.PI) / 180));
  
  // Angular beam attenuation
  const beamFactor = Math.max(0, Math.cos(Math.min(Math.PI / 2, (angleOffset * Math.PI) / (BEAM_HALF_ANGLE * 2.5))));
  
  // Total received echo signal power (normalized 0 to 1)
  const echoPower = mat.reflectivity * orientationFactor * beamFactor;
  
  // HC-SR04 threshold: if echo is too weak or target out of beam, no echo is detected (returns out-of-range ~400cm or timeout)
  if (echoPower < 0.15 || actualDistanceCm > 400 || actualDistanceCm < 2) {
    return {
      measuredDistance: 400,
      timeOfFlight: calculateTimeOfFlight(400, speedOfSoundMs),
      detected: false,
      echoPower,
      error: 400 - actualDistanceCm,
      percentageError: Math.abs((400 - actualDistanceCm) / actualDistanceCm) * 100
    };
  }
  
  // Physical noise: Arduino pulseIn() has ±1 to 4 μs jitter, speed of sound micro-variations
  let noiseCm = 0;
  if (addNoise) {
    // Normal distribution-like noise: ±0.3 cm sensor resolution
    const u1 = Math.random();
    const u2 = Math.random();
    const randStd = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);
    noiseCm = randStd * 0.25; // std dev 0.25 cm
    
    // Low reflectivity surfaces (e.g. foam/slanted) increase timing uncertainty
    if (echoPower < 0.5) {
      noiseCm += (Math.random() - 0.5) * 0.8;
    }
  }
  
  const rawMeasured = Math.max(2, actualDistanceCm + noiseCm);
  // Arduino code round to 1 decimal place typically
  const measuredDistance = Math.round(rawMeasured * 10) / 10;
  const timeOfFlight = calculateTimeOfFlight(measuredDistance, speedOfSoundMs);
  
  const error = Math.round((measuredDistance - actualDistanceCm) * 100) / 100;
  const percentageError = actualDistanceCm > 0 
    ? Math.round((Math.abs(error) / actualDistanceCm) * 10000) / 100 
    : 0;

  return {
    measuredDistance,
    timeOfFlight: Math.round(timeOfFlight),
    detected: true,
    echoPower: Math.round(echoPower * 100) / 100,
    error,
    percentageError
  };
}

/**
 * Determine zone based on detected distance and configured thresholds
 */
export function determineSafetyStatus(distanceCm: number, thresholds: ZoneThresholds): SafetyStatus {
  if (distanceCm < thresholds.dangerDistance) {
    return 'DANGER';
  } else if (distanceCm <= thresholds.safeDistance) {
    return 'WARNING';
  }
  return 'SAFE';
}
