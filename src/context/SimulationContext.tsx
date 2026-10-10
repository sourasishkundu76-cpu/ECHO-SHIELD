import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  SafetyStatus, 
  ObstacleMaterial, 
  ZoneThresholds, 
  TelemetryData, 
  ExperimentTrial, 
  ActiveTab 
} from '../types';
import { 
  calculateSpeedOfSound, 
  determineSafetyStatus, 
  simulateHCSR04Reading 
} from '../utils/physics';

interface SimulationContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Real-time Telemetry
  telemetry: TelemetryData;
  telemetryHistory: { time: number; distance: number; angle: number; status: SafetyStatus }[];
  
  // Controls & Configurations
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  isScanning: boolean;
  setIsScanning: (val: boolean) => void;
  scanSpeed: number; // 1 to 5
  setScanSpeed: (speed: number) => void;
  servoAngle: number; // 0 to 90 degrees
  scanSweepAngle: number; // 0 to 90 degrees
  setManualAngle: (angle: number) => void;
  
  // Obstacle Settings
  isObstaclePresent: boolean;
  setIsObstaclePresent: (val: boolean) => void;
  obstacleDistance: number; // 5 to 100 cm
  setObstacleDistance: (dist: number) => void;
  obstacleAngle: number; // -45 to 45 deg
  setObstacleAngle: (angle: number) => void;
  obstacleMaterial: ObstacleMaterial;
  setObstacleMaterial: (mat: ObstacleMaterial) => void;
  
  // Environmental & Safety Zone Settings
  temperature: number; // °C
  setTemperature: (temp: number) => void;
  zoneThresholds: ZoneThresholds;
  setZoneThresholds: (thresholds: ZoneThresholds) => void;
  
  // Experimental Trials Log
  trials: ExperimentTrial[];
  addTrial: (trial?: Partial<ExperimentTrial>) => void;
  clearTrials: () => void;
  runStandardDistancesBenchmark: () => void;
  
  // Demonstration Mode
  isDemonstrating: boolean;
  demonstrationStep: number;
  demonstrationDescription: string;
  startDemonstration: () => void;
  stopDemonstration: () => void;
  
  // Hardware Connection (Web Serial API)
  isHardwareConnected: boolean;
  hardwarePortName: string | null;
  connectHardware: () => Promise<void>;
  disconnectHardware: () => void;
  hardwareError: string | null;
  
  // Reset
  resetSimulation: () => void;
}

const DEFAULT_THRESHOLDS: ZoneThresholds = {
  safeDistance: 50,
  warningDistance: 20,
  dangerDistance: 20
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanSpeed, setScanSpeed] = useState<number>(2); // 1 to 5
  const [servoAngle, setServoAngle] = useState<number>(45); // center is 45° (scanning 0° to 90°)
  const scanDirectionRef = useRef<number>(1); // 1 = increasing, -1 = decreasing
  
  // Obstacle state
  const [isObstaclePresent, setIsObstaclePresent] = useState<boolean>(true);
  const [obstacleDistance, setObstacleDistance] = useState<number>(28); // 28 cm initially (Warning zone)
  const [obstacleAngle, setObstacleAngle] = useState<number>(0);
  const [obstacleMaterial, setObstacleMaterial] = useState<ObstacleMaterial>('plastic');
  
  // Environment & Thresholds
  const [temperature, setTemperature] = useState<number>(20); // 20°C standard lab temperature
  const [zoneThresholds, setZoneThresholds] = useState<ZoneThresholds>(DEFAULT_THRESHOLDS);
  
  // Hardware connection
  const [isHardwareConnected, setIsHardwareConnected] = useState<boolean>(false);
  const [hardwarePortName, setHardwarePortName] = useState<string | null>(null);
  const [hardwareError, setHardwareError] = useState<string | null>(null);
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);

  // Demonstration mode
  const [isDemonstrating, setIsDemonstrating] = useState<boolean>(false);
  const [demonstrationStep, setDemonstrationStep] = useState<number>(0);
  const [demonstrationDescription, setDemonstrationDescription] = useState<string>('');

  // Telemetry state
  const [telemetry, setTelemetry] = useState<TelemetryData>(() => {
    const v = calculateSpeedOfSound(20);
    return {
      timestamp: Date.now(),
      actualDistance: 28,
      measuredDistance: 28.1,
      timeOfFlight: 1638,
      servoAngle: 45,
      ultrasonicFrequency: 40,
      speedOfSound: Math.round(v * 10) / 10,
      error: 0.1,
      percentageError: 0.36,
      status: 'WARNING',
      detected: true,
      receivedEchoPower: 0.92
    };
  });

  const [telemetryHistory, setTelemetryHistory] = useState<
    { time: number; distance: number; angle: number; status: SafetyStatus }[]
  >([]);

  // Trials for experimental laboratory
  const [trials, setTrials] = useState<ExperimentTrial[]>([
    {
      id: 'trial-1',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      actualDistance: 10,
      measuredDistance: 10.1,
      timeOfFlight: 589,
      error: 0.1,
      percentageError: 1.0,
      servoAngle: 45,
      material: 'metal',
      obstacleAngle: 0,
      temperature: 20,
      status: 'DANGER'
    },
    {
      id: 'trial-2',
      timestamp: new Date(Date.now() - 90000).toLocaleTimeString(),
      actualDistance: 25,
      measuredDistance: 24.8,
      timeOfFlight: 1446,
      error: -0.2,
      percentageError: 0.8,
      servoAngle: 45,
      material: 'plastic',
      obstacleAngle: 0,
      temperature: 20,
      status: 'WARNING'
    },
    {
      id: 'trial-3',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      actualDistance: 55,
      measuredDistance: 55.3,
      timeOfFlight: 3224,
      error: 0.3,
      percentageError: 0.55,
      servoAngle: 45,
      material: 'wood',
      obstacleAngle: 0,
      temperature: 20,
      status: 'SAFE'
    }
  ]);

  // Main simulation tick loop
  useEffect(() => {
    if (!isPlaying && !isHardwareConnected) return;

    const interval = setInterval(() => {
      // 1. Advance scanning servo angle if scanning is enabled
      let currentAngle = servoAngle;
      if (isScanning && !isHardwareConnected) {
        setServoAngle((prev) => {
          let next = prev + scanDirectionRef.current * (scanSpeed * 1.5);
          if (next >= 90) {
            next = 90;
            scanDirectionRef.current = -1;
          } else if (next <= 0) {
            next = 0;
            scanDirectionRef.current = 1;
          }
          currentAngle = next;
          return next;
        });
      }

      // 2. Physics calculation
      const currentSpeedOfSound = calculateSpeedOfSound(temperature);
      
      // Calculate effective distance to obstacle
      // If obstacle is present and within sensor scan line of sight
      let activeDist = isObstaclePresent ? obstacleDistance : 350; // out of range if no obstacle
      
      const reading = simulateHCSR04Reading(
        activeDist,
        currentAngle,
        obstacleAngle,
        obstacleMaterial,
        currentSpeedOfSound,
        true
      );

      const status = determineSafetyStatus(reading.measuredDistance, zoneThresholds);

      const updatedTelemetry: TelemetryData = {
        timestamp: Date.now(),
        actualDistance: activeDist,
        measuredDistance: reading.measuredDistance,
        timeOfFlight: reading.timeOfFlight,
        servoAngle: Math.round(currentAngle),
        ultrasonicFrequency: 40,
        speedOfSound: Math.round(currentSpeedOfSound * 10) / 10,
        error: reading.error,
        percentageError: reading.percentageError,
        status,
        detected: reading.detected,
        receivedEchoPower: reading.echoPower
      };

      setTelemetry(updatedTelemetry);

      setTelemetryHistory((prev) => {
        const next = [
          ...prev,
          {
            time: Date.now(),
            distance: reading.measuredDistance,
            angle: Math.round(currentAngle),
            status
          }
        ];
        return next.slice(-60); // keep last 60 records for live chart
      });
    }, 120);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    isScanning,
    scanSpeed,
    servoAngle,
    isObstaclePresent,
    obstacleDistance,
    obstacleAngle,
    obstacleMaterial,
    temperature,
    zoneThresholds,
    isHardwareConnected
  ]);

  const setManualAngle = useCallback((angle: number) => {
    setIsScanning(false);
    setServoAngle(Math.max(0, Math.min(90, angle)));
  }, []);

  const addTrial = useCallback((partialTrial?: Partial<ExperimentTrial>) => {
    const trial: ExperimentTrial = {
      id: `trial-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actualDistance: partialTrial?.actualDistance ?? telemetry.actualDistance,
      measuredDistance: partialTrial?.measuredDistance ?? telemetry.measuredDistance,
      timeOfFlight: partialTrial?.timeOfFlight ?? telemetry.timeOfFlight,
      error: partialTrial?.error ?? telemetry.error,
      percentageError: partialTrial?.percentageError ?? telemetry.percentageError,
      servoAngle: partialTrial?.servoAngle ?? telemetry.servoAngle,
      material: partialTrial?.material ?? obstacleMaterial,
      obstacleAngle: partialTrial?.obstacleAngle ?? obstacleAngle,
      temperature: partialTrial?.temperature ?? temperature,
      status: partialTrial?.status ?? telemetry.status
    };
    setTrials((prev) => [trial, ...prev]);
  }, [telemetry, obstacleMaterial, obstacleAngle, temperature]);

  const clearTrials = useCallback(() => {
    setTrials([]);
  }, []);

  const runStandardDistancesBenchmark = useCallback(() => {
    const distances = [10, 20, 30, 40, 50, 60, 70, 80];
    const speed = calculateSpeedOfSound(temperature);
    const newTrials: ExperimentTrial[] = [];

    distances.forEach((d) => {
      const sim = simulateHCSR04Reading(d, 45, 0, obstacleMaterial, speed, true);
      const st = determineSafetyStatus(sim.measuredDistance, zoneThresholds);
      newTrials.push({
        id: `bench-${d}-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actualDistance: d,
        measuredDistance: sim.measuredDistance,
        timeOfFlight: sim.timeOfFlight,
        error: sim.error,
        percentageError: sim.percentageError,
        servoAngle: 45,
        material: obstacleMaterial,
        obstacleAngle: 0,
        temperature,
        status: st
      });
    });

    setTrials((prev) => [...newTrials, ...prev]);
  }, [temperature, obstacleMaterial, zoneThresholds]);

  // Cinematic Demonstration sequence
  const demoTimerRef = useRef<any>(null);
  const startDemonstration = useCallback(() => {
    setIsDemonstrating(true);
    setDemonstrationStep(1);
    setIsPlaying(true);
    setIsScanning(false);
    setActiveTab('home');

    // 12 scripted demonstration stages
    const steps = [
      { step: 1, desc: 'Phase 1: Focusing camera on miniature railway track and train environment.', angle: 45, dist: 65, obs: false },
      { step: 2, desc: 'Phase 2: Arduino initializes SG90 Servo motor and begins scanning arc (0° → 90°).', angle: 15, dist: 65, obs: false },
      { step: 3, desc: 'Phase 3: HC-SR04 Trigger pin emits 10 μs pulse; 8-cycle 40 kHz ultrasonic wavefront expands.', angle: 45, dist: 65, obs: false },
      { step: 4, desc: 'Phase 4: Track Clear. Ultrasonic waves travel forward into safe zone (>50 cm). Green LED remains ON.', angle: 45, dist: 65, obs: false },
      { step: 5, desc: 'Phase 5: Obstacle introduced on railway tracks at 35 cm (Warning Zone).', angle: 45, dist: 35, obs: true },
      { step: 6, desc: 'Phase 6: Ultrasonic wave hits obstacle surface; acoustic reflection produces returning echo.', angle: 45, dist: 35, obs: true },
      { step: 7, desc: 'Phase 7: HC-SR04 Echo pin measures Time-of-Flight (~2040 μs). Arduino calculates distance d ≈ 35.0 cm.', angle: 45, dist: 35, obs: true },
      { step: 8, desc: 'Phase 8: Warning zone threshold breached. Breadboard Yellow LED illuminates.', angle: 45, dist: 35, obs: true },
      { step: 9, desc: 'Phase 9: Miniature train approaches closer! Obstacle enters Danger Zone (<20 cm) at 12 cm.', angle: 45, dist: 12, obs: true },
      { step: 10, desc: 'Phase 10: ToF drops to ~700 μs. DANGER STATUS triggered! Red LED flashes on breadboard.', angle: 45, dist: 12, obs: true },
      { step: 11, desc: 'Phase 11: Real-time telemetry dashboard updates distance, wave calculations, and error rate.', angle: 45, dist: 12, obs: true },
      { step: 12, desc: 'Phase 12: Physics demonstration concluded. v = 343 m/s, d = (v × t) / 2 verified.', angle: 45, dist: 12, obs: true },
    ];

    let currentIdx = 0;
    const runNextStep = () => {
      if (currentIdx >= steps.length) {
        setIsDemonstrating(false);
        setDemonstrationDescription('Demonstration completed. Ready for manual exploration.');
        return;
      }
      const s = steps[currentIdx];
      setDemonstrationStep(s.step);
      setDemonstrationDescription(s.desc);
      setServoAngle(s.angle);
      setObstacleDistance(s.dist);
      setIsObstaclePresent(s.obs);
      currentIdx++;
      demoTimerRef.current = setTimeout(runNextStep, 3500);
    };

    runNextStep();
  }, []);

  const stopDemonstration = useCallback(() => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setIsDemonstrating(false);
    setDemonstrationStep(0);
    setDemonstrationDescription('');
  }, []);

  // Web Serial API handler
  const connectHardware = async () => {
    setHardwareError(null);
    if (!('serial' in navigator)) {
      setHardwareError('Web Serial API is not supported in this browser. Use Chrome or Edge.');
      return;
    }

    try {
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      serialPortRef.current = port;
      setIsHardwareConnected(true);
      setHardwarePortName('Arduino USB (COM)');

      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      serialReaderRef.current = reader;

      let buffer = '';
      (async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              buffer += value;
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                // Expected format from Arduino sketch:
                // "DIST:24.5,ANGLE:45,TOF:1428"
                const distMatch = line.match(/DIST:([\d.]+)/i);
                const angleMatch = line.match(/ANGLE:(\d+)/i);
                const tofMatch = line.match(/TOF:(\d+)/i);

                if (distMatch) {
                  const mDist = parseFloat(distMatch[1]);
                  const mAngle = angleMatch ? parseInt(angleMatch[1]) : 45;
                  const mTof = tofMatch ? parseInt(tofMatch[1]) : Math.round((mDist * 2 * 1e4) / 343);
                  
                  const status = determineSafetyStatus(mDist, zoneThresholds);
                  setServoAngle(mAngle);
                  setTelemetry({
                    timestamp: Date.now(),
                    actualDistance: mDist,
                    measuredDistance: mDist,
                    timeOfFlight: mTof,
                    servoAngle: mAngle,
                    ultrasonicFrequency: 40,
                    speedOfSound: 343,
                    error: 0,
                    percentageError: 0,
                    status,
                    detected: mDist < 300,
                    receivedEchoPower: 1.0
                  });
                }
              }
            }
          }
        } catch (err: any) {
          console.warn('Serial read ended', err);
        }
      })();
    } catch (err: any) {
      setHardwareError(err.message || 'Failed to open serial connection to Arduino.');
      setIsHardwareConnected(false);
    }
  };

  const disconnectHardware = () => {
    try {
      if (serialReaderRef.current) {
        serialReaderRef.current.cancel();
      }
      if (serialPortRef.current) {
        serialPortRef.current.close();
      }
    } catch (e) {
      console.warn('Error closing port', e);
    }
    serialPortRef.current = null;
    serialReaderRef.current = null;
    setIsHardwareConnected(false);
    setHardwarePortName(null);
  };

  const resetSimulation = () => {
    stopDemonstration();
    setIsPlaying(true);
    setIsScanning(true);
    setScanSpeed(2);
    setServoAngle(45);
    setIsObstaclePresent(true);
    setObstacleDistance(28);
    setObstacleAngle(0);
    setObstacleMaterial('plastic');
    setTemperature(20);
    setZoneThresholds(DEFAULT_THRESHOLDS);
  };

  return (
    <SimulationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        telemetry,
        telemetryHistory,
        isPlaying,
        setIsPlaying,
        isScanning,
        setIsScanning,
        scanSpeed,
        setScanSpeed,
        servoAngle,
        scanSweepAngle: servoAngle,
        setManualAngle,
        isObstaclePresent,
        setIsObstaclePresent,
        obstacleDistance,
        setObstacleDistance,
        obstacleAngle,
        setObstacleAngle,
        obstacleMaterial,
        setObstacleMaterial,
        temperature,
        setTemperature,
        zoneThresholds,
        setZoneThresholds,
        trials,
        addTrial,
        clearTrials,
        runStandardDistancesBenchmark,
        isDemonstrating,
        demonstrationStep,
        demonstrationDescription,
        startDemonstration,
        stopDemonstration,
        isHardwareConnected,
        hardwarePortName,
        connectHardware,
        disconnectHardware,
        hardwareError,
        resetSimulation
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
