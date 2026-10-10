import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Compass, 
  Radar, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Activity, 
  Eye, 
  Layers, 
  Sparkles 
} from 'lucide-react';

export const ScannerSection: React.FC = () => {
  const {
    telemetry,
    isScanning,
    setIsScanning,
    scanSpeed,
    setScanSpeed,
    scanSweepAngle,
    setManualAngle,
    isObstaclePresent,
    obstacleDistance,
    obstacleAngle
  } = useSimulation();

  const [scanHistory, setScanHistory] = useState<{ angle: number; distance: number; detected: boolean }[]>([]);

  // Collect polar scan points
  React.useEffect(() => {
    setScanHistory((prev) => {
      const point = {
        angle: telemetry.servoAngle,
        distance: telemetry.measuredDistance,
        detected: telemetry.detected
      };
      // Keep up to 90 angular samples
      return [...prev.slice(-89), point];
    });
  }, [telemetry.servoAngle, telemetry.measuredDistance, telemetry.detected]);

  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
          <span>Rotational Acoustic RADAR / SONAR Sweep</span>
          <span>·</span>
          <span>SG90 Servo + HC-SR04</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          ULTRASONIC SCANNER & POLAR RADAR SWEEP
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl">
          By mounting the HC-SR04 ultrasonic sensor on top of the SG90 micro-servo horn, the system continuously rotates across a 0° to 90° azimuth arc to survey the railway corridor for foreign objects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Polar Radar Scope Display (Left) */}
        <div className="lg:col-span-7 rounded-xl p-6 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-sm text-slate-200">ACTIVE RADAR DISPLAY (POLAR SCOPE)</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              Angle: {telemetry.servoAngle}° | Range: {telemetry.measuredDistance.toFixed(1)} cm
            </span>
          </div>

          {/* SVG Polar Radar Sweep */}
          <div className="relative my-6 w-full max-w-[420px] aspect-square flex items-center justify-center">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Concentric distance range rings */}
              <circle cx="150" cy="150" r="130" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="150" cy="150" r="95" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="150" cy="150" r="60" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="150" cy="150" r="25" fill="none" stroke="#1e293b" strokeWidth="1.5" />

              {/* Range Labels */}
              <text x="154" y="27" fill="#64748b" fontSize="8" fontFamily="monospace">80cm</text>
              <text x="154" y="62" fill="#64748b" fontSize="8" fontFamily="monospace">50cm (Safe)</text>
              <text x="154" y="97" fill="#64748b" fontSize="8" fontFamily="monospace">20cm (Danger)</text>

              {/* Crosshair & Angle Rays */}
              <line x1="150" y1="20" x2="150" y2="280" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="20" y1="150" x2="280" y2="150" stroke="#0f172a" strokeWidth="1.5" />

              {/* 0° to 90° Scan Sector Arc */}
              <path
                d="M 150 150 L 280 150 A 130 130 0 0 0 150 20 Z"
                fill="#38bdf8"
                fillOpacity="0.04"
                stroke="#0284c7"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Historical scan blips */}
              {scanHistory.map((pt, idx) => {
                // Map angle (0° to 90°)
                const rad = (Math.PI / 180) * (90 - pt.angle);
                const r = Math.min(130, (pt.distance / 80) * 130);
                const bx = 150 + r * Math.cos(rad);
                const by = 150 - r * Math.sin(rad);
                const age = idx / scanHistory.length; // 0 to 1
                return (
                  <circle
                    key={idx}
                    cx={bx}
                    cy={by}
                    r={pt.detected && pt.distance < 70 ? 3 : 1.5}
                    fill={pt.distance < 20 ? '#ef4444' : pt.distance <= 50 ? '#f59e0b' : '#10b981'}
                    opacity={age * 0.8}
                  />
                );
              })}

              {/* Active Sweeping Line */}
              {(() => {
                const rad = (Math.PI / 180) * (90 - telemetry.servoAngle);
                const lx = 150 + 130 * Math.cos(rad);
                const ly = 150 - 130 * Math.sin(rad);

                // Obstacle blip on active beam
                const rDist = Math.min(130, (telemetry.measuredDistance / 80) * 130);
                const ox = 150 + rDist * Math.cos(rad);
                const oy = 150 - rDist * Math.sin(rad);

                return (
                  <>
                    <line x1="150" y1="150" x2={lx} y2={ly} stroke="#38bdf8" strokeWidth="2.5" />
                    {isObstaclePresent && (
                      <circle
                        cx={ox}
                        cy={oy}
                        r="6"
                        fill={telemetry.status === 'SAFE' ? '#10b981' : telemetry.status === 'WARNING' ? '#f59e0b' : '#ef4444'}
                        className="animate-ping"
                      />
                    )}
                  </>
                );
              })()}

              {/* Sensor Center Origin Point */}
              <circle cx="150" cy="150" r="4" fill="#38bdf8" />
            </svg>
          </div>

          <div className="w-full flex justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span>0° = Track Left Periphery</span>
            <span>45° = Direct Track Center</span>
            <span>90° = Track Right Shoulder</span>
          </div>
        </div>

        {/* Scanner Controls & Parameters (Right) */}
        <div className="lg:col-span-5 rounded-xl p-6 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Scanner Execution Controls
            </h3>

            {/* Sweep Toggle & Speed */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Servo Sweep Engine</span>
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isScanning
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isScanning ? 'Auto Sweep ACTIVE' : 'Sweep PAUSED'}
                </button>
              </div>

              {/* Speed Slider */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Sweep Rate:</span>
                  <span className="text-cyan-400 font-bold">{scanSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={scanSpeed}
                  onChange={(e) => setScanSpeed(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Manual Angle Stepping */}
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Manual Azimuth Heading:</span>
                  <span className="text-indigo-400 font-bold">{telemetry.servoAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={telemetry.servoAngle}
                  onChange={(e) => setManualAngle(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="mb-4">
              <span className="text-xs text-slate-400 block mb-2 font-mono">Quick Angle Targets:</span>
              <div className="grid grid-cols-4 gap-2">
                {[0, 30, 45, 90].map((ang) => (
                  <button
                    key={ang}
                    onClick={() => setManualAngle(ang)}
                    className="py-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200"
                  >
                    {ang}°
                  </button>
                ))}
              </div>
            </div>

            {/* Physics of Scanning */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <strong className="text-cyan-400 block">Angular Beam Geometry:</strong>
              <span>
                The HC-SR04 emits an acoustic cone of ~15° beamwidth. Rotating across 0° to 90° with 5° increments ensures complete spatial overlap across the track clearance gauge without blind spots.
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Hardware: SG90 PWM Driven by Arduino Pin 9 via Servo.h
          </div>
        </div>
      </div>
    </div>
  );
};
