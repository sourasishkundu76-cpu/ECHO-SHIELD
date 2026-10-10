import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Radio, 
  Activity, 
  Compass, 
  Waves, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Gauge,
  Thermometer,
  Cpu,
  Sparkles,
  Info
} from 'lucide-react';
import { MATERIALS_DATA } from '../../utils/physics';
import { ObstacleMaterial } from '../../types';

export const LiveDashboard: React.FC = () => {
  const {
    telemetry,
    telemetryHistory,
    isPlaying,
    setIsPlaying,
    isScanning,
    setIsScanning,
    scanSpeed,
    setScanSpeed,
    scanSweepAngle,
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
    startDemonstration,
    isDemonstrating,
    stopDemonstration,
    resetSimulation
  } = useSimulation();

  const [activeChartTab, setActiveChartTab] = useState<'timeline' | 'radar' | 'calibration'>('timeline');

  // Derive SVG path for timeline history
  const maxDistanceScale = 100;
  const chartHeight = 120;
  const chartWidth = 360;

  const points = telemetryHistory.map((item, idx) => {
    const x = (idx / Math.max(1, telemetryHistory.length - 1)) * chartWidth;
    const clampedDist = Math.min(maxDistanceScale, Math.max(0, item.distance));
    const y = chartHeight - (clampedDist / maxDistanceScale) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const currentMat = MATERIALS_DATA[obstacleMaterial];

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner: Status + Hardware Indicator Mirror */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Status Callout Card */}
        <div className={`lg:col-span-8 rounded-xl p-5 border backdrop-blur-md transition-all flex flex-col justify-between ${
          telemetry.status === 'SAFE'
            ? 'bg-emerald-950/20 border-emerald-800/60 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
            : telemetry.status === 'WARNING'
            ? 'bg-amber-950/25 border-amber-800/60 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
            : 'bg-rose-950/30 border-rose-800/80 shadow-[0_0_25px_rgba(244,63,94,0.15)] animate-pulse'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 text-xs font-mono uppercase tracking-widest text-slate-400">
                <span>Ultrasonic Railway Monitor</span>
                <span>·</span>
                <span>HC-SR04 + Servo SG90</span>
              </div>
              <h2 className="text-2xl font-bold flex items-center gap-2.5">
                {telemetry.status === 'SAFE' && (
                  <>
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    <span className="text-emerald-300">TRACK CLEAR — SAFE ZONE</span>
                  </>
                )}
                {telemetry.status === 'WARNING' && (
                  <>
                    <AlertTriangle className="w-7 h-7 text-amber-400" />
                    <span className="text-amber-300">CAUTION — OBJECT IN WARNING ZONE</span>
                  </>
                )}
                {telemetry.status === 'DANGER' && (
                  <>
                    <ShieldAlert className="w-7 h-7 text-rose-400" />
                    <span className="text-rose-300">CRITICAL — OBSTACLE DETECTED ON TRACK!</span>
                  </>
                )}
              </h2>
            </div>

            {/* Quick Demo Launch Button */}
            <div>
              {!isDemonstrating ? (
                <button
                  onClick={startDemonstration}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-semibold transition-all shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cinematic Demo</span>
                </button>
              ) : (
                <button
                  onClick={stopDemonstration}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold transition-all shadow-md"
                >
                  <span>Stop Demo</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 font-mono">
            <div>
              <span className="text-slate-500">Physics Principle: </span>
              <span className="text-cyan-400 font-semibold">d = (v × t) / 2</span>
              <span className="text-slate-500"> = ({telemetry.speedOfSound} m/s × {telemetry.timeOfFlight} μs) / 2 = </span>
              <span className="text-emerald-400 font-bold">{telemetry.measuredDistance.toFixed(1)} cm</span>
            </div>
            <div>
              <span className="text-slate-500">Reflectivity Factor: </span>
              <span className="text-amber-400">{(telemetry.receivedEchoPower * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Physical Breadboard & LED Hardware Twin */}
        <div className="lg:col-span-4 rounded-xl p-4 bg-slate-900/90 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 tracking-wider">BREADBOARD LED STATUS</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Arduino Digital Pins 11, 12, 13</span>
          </div>

          {/* Breadboard Visual Replica */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-around">
            {/* Green LED */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                  telemetry.status === 'SAFE'
                    ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_20px_#10b981]'
                    : 'bg-emerald-950/60 border-emerald-900/60'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${telemetry.status === 'SAFE' ? 'bg-white' : 'bg-transparent'}`} />
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400">GREEN</span>
              <span className="text-[9px] text-slate-400 font-mono">D13 · Clear</span>
            </div>

            {/* Yellow LED */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                  telemetry.status === 'WARNING'
                    ? 'bg-amber-400 border-amber-300 shadow-[0_0_20px_#f59e0b]'
                    : 'bg-amber-950/60 border-amber-900/60'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${telemetry.status === 'WARNING' ? 'bg-white' : 'bg-transparent'}`} />
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-400">YELLOW</span>
              <span className="text-[9px] text-slate-400 font-mono">D12 · Caution</span>
            </div>

            {/* Red LED */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                  telemetry.status === 'DANGER'
                    ? 'bg-rose-500 border-rose-300 shadow-[0_0_25px_#f43f5e] animate-pulse'
                    : 'bg-rose-950/60 border-rose-900/60'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${telemetry.status === 'DANGER' ? 'bg-white' : 'bg-transparent'}`} />
              </div>
              <span className="text-[11px] font-mono font-bold text-rose-400">RED</span>
              <span className="text-[9px] text-slate-400 font-mono">D11 · Danger</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Exact circuit match to the hardware breadboard shown in the video.
          </p>
        </div>
      </div>

      {/* Real-Time Telemetry Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Distance Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider">Distance (d)</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-cyan-400">{telemetry.measuredDistance.toFixed(1)}</span>
            <span className="text-xs text-slate-400 ml-1">cm</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex justify-between">
            <span>Actual: {telemetry.actualDistance.toFixed(1)} cm</span>
          </div>
        </div>

        {/* Time of Flight Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider">Time of Flight</span>
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-amber-400">{telemetry.timeOfFlight}</span>
            <span className="text-xs text-slate-400 ml-1">μs</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <span>{(telemetry.timeOfFlight / 1000).toFixed(3)} ms round-trip</span>
          </div>
        </div>

        {/* Servo Angle Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider">Servo Angle</span>
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-indigo-400">{telemetry.servoAngle}</span>
            <span className="text-xs text-slate-400 ml-1">deg (°)</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <span>{isScanning ? 'Auto Sweep (0°–90°)' : 'Manual Hold'}</span>
          </div>
        </div>

        {/* Frequency Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider">Ultrasonic Freq</span>
            <Waves className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-sky-400">{telemetry.ultrasonicFrequency}</span>
            <span className="text-xs text-slate-400 ml-1">kHz</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <span>λ ≈ {((telemetry.speedOfSound / (telemetry.ultrasonicFrequency * 1000)) * 1000).toFixed(1)} mm</span>
          </div>
        </div>

        {/* Speed of Sound Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider">Speed of Sound</span>
            <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-emerald-400">{telemetry.speedOfSound}</span>
            <span className="text-xs text-slate-400 ml-1">m/s</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <span>At {temperature}°C ambient air</span>
          </div>
        </div>

        {/* Measurement Error Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px] tracking-wider">Observed Error</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black font-mono text-purple-400">{telemetry.percentageError.toFixed(2)}</span>
            <span className="text-xs text-slate-400 ml-1">%</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <span>Δ = {telemetry.error > 0 ? `+${telemetry.error.toFixed(2)}` : telemetry.error.toFixed(2)} cm</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Controls & Graphs Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Panel (Left, 6 cols) */}
        <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-200">REAL-TIME SIMULATION CONTROLS</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1.5 rounded transition-colors ${
                  isPlaying ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/50' : 'bg-emerald-600 text-white'
                }`}
                title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={resetSimulation}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset All Parameters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Servo Motor Controls */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                SG90 Servo Scanner
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`px-2.5 py-1 rounded font-medium text-xs transition-colors ${
                    isScanning
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isScanning ? 'Auto Sweep ON' : 'Sweep Paused'}
                </button>
              </div>
            </div>

            {/* Angle Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Current Sensor Angle:</span>
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
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0° (Left Track)</span>
                <span>45° (Bore Sight)</span>
                <span>90° (Right Track)</span>
              </div>
            </div>

            {/* Sweep Speed Slider */}
            {isScanning && (
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Sweep Rate:</span>
                  <span className="text-cyan-400">{scanSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={scanSpeed}
                  onChange={(e) => setScanSpeed(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Obstacle Controls */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Track Obstacle Setup
              </span>
              <button
                onClick={() => setIsObstaclePresent(!isObstaclePresent)}
                className={`px-2.5 py-1 rounded font-medium text-xs transition-colors ${
                  isObstaclePresent
                    ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isObstaclePresent ? 'Obstacle Present' : 'Track Empty'}
              </button>
            </div>

            {/* Distance Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Obstacle Distance along Track:</span>
                <span className="text-cyan-400 font-bold">{obstacleDistance} cm</span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                step="1"
                disabled={!isObstaclePresent}
                value={obstacleDistance}
                onChange={(e) => setObstacleDistance(parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span className="text-rose-400">5 cm (Danger)</span>
                <span className="text-amber-400">20–50 cm (Warning)</span>
                <span className="text-emerald-400">&gt;50 cm (Safe)</span>
              </div>
            </div>

            {/* Obstacle Material & Orientation */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Surface Material:</label>
                <select
                  value={obstacleMaterial}
                  onChange={(e) => setObstacleMaterial(e.target.value as ObstacleMaterial)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="metal">Metal (Aluminum/Steel)</option>
                  <option value="plastic">Plastic (Rigid ABS)</option>
                  <option value="wood">Wood (Plywood/Block)</option>
                  <option value="cardboard">Cardboard</option>
                  <option value="foam">Acoustic Foam</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Obstacle Tilt:</span>
                  <span className="text-amber-400 font-mono">{obstacleAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="5"
                  value={obstacleAngle}
                  onChange={(e) => setObstacleAngle(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Configurable Safety Zone Thresholds */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-slate-300">CONFIGURABLE SAFETY ZONES</span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Danger Zone (&lt; cm):</label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  value={zoneThresholds.dangerDistance}
                  onChange={(e) =>
                    setZoneThresholds({
                      ...zoneThresholds,
                      dangerDistance: parseInt(e.target.value) || 20,
                      warningDistance: parseInt(e.target.value) || 20
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Safe Zone (&gt; cm):</label>
                <input
                  type="number"
                  min="30"
                  max="90"
                  value={zoneThresholds.safeDistance}
                  onChange={(e) =>
                    setZoneThresholds({
                      ...zoneThresholds,
                      safeDistance: parseInt(e.target.value) || 50
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Live Graphs Panel (Right, 6 cols) */}
        <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-200">REAL-TIME DATA PLOTS</h3>
            </div>

            {/* Segmented Chart Selector */}
            <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveChartTab('timeline')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  activeChartTab === 'timeline'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Distance vs Time
              </button>
              <button
                onClick={() => setActiveChartTab('radar')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  activeChartTab === 'radar'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Radar Polar
              </button>
              <button
                onClick={() => setActiveChartTab('calibration')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  activeChartTab === 'calibration'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Calibration
              </button>
            </div>
          </div>

          {/* Chart Content Body */}
          <div className="flex-1 min-h-[260px] p-4 rounded-lg bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
            {activeChartTab === 'timeline' && (
              <div className="w-full flex flex-col justify-between h-full">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-2">
                  <span>Y: Detected Distance (cm)</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2 h-0.5 bg-emerald-400" /> &gt;50cm Safe
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-2 h-0.5 bg-amber-400" /> 20–50cm Warning
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <span className="w-2 h-0.5 bg-rose-400" /> &lt;20cm Danger
                    </span>
                  </div>
                </div>

                {/* SVG Oscilloscope Strip Chart */}
                <div className="relative w-full h-[180px] bg-slate-900/60 rounded border border-slate-800 overflow-hidden">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
                    {/* Zone threshold reference lines */}
                    {/* Safe threshold (>50cm) */}
                    <line
                      x1="0"
                      y1={chartHeight - (zoneThresholds.safeDistance / maxDistanceScale) * chartHeight}
                      x2={chartWidth}
                      y2={chartHeight - (zoneThresholds.safeDistance / maxDistanceScale) * chartHeight}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                      opacity="0.4"
                    />
                    {/* Danger threshold (<20cm) */}
                    <line
                      x1="0"
                      y1={chartHeight - (zoneThresholds.dangerDistance / maxDistanceScale) * chartHeight}
                      x2={chartWidth}
                      y2={chartHeight - (zoneThresholds.dangerDistance / maxDistanceScale) * chartHeight}
                      stroke="#f43f5e"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                      opacity="0.5"
                    />

                    {/* Polyline data path */}
                    {points && (
                      <polyline
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                    )}
                  </svg>

                  {/* Current reading callout pin */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/90 border border-slate-700 rounded text-xs font-mono text-cyan-300">
                    {telemetry.measuredDistance.toFixed(1)} cm
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2">
                  <span>-30s</span>
                  <span>Time Evolution (Real-time Sample Rate: ~8 Hz)</span>
                  <span>Now</span>
                </div>
              </div>
            )}

            {activeChartTab === 'radar' && (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-[220px] h-[130px] overflow-hidden flex items-end justify-center">
                  <svg viewBox="0 0 200 110" className="w-full h-full">
                    {/* Radar arcs */}
                    <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M 35 100 A 65 65 0 0 1 165 100" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    <path d="M 65 100 A 35 35 0 0 1 135 100" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    
                    {/* Angle rays */}
                    <line x1="100" y1="100" x2="10" y2="100" stroke="#1e293b" strokeWidth="1" />
                    <line x1="100" y1="100" x2="36" y2="36" stroke="#1e293b" strokeWidth="1" />
                    <line x1="100" y1="100" x2="100" y2="10" stroke="#1e293b" strokeWidth="1" />
                    <line x1="100" y1="100" x2="164" y2="36" stroke="#1e293b" strokeWidth="1" />
                    <line x1="100" y1="100" x2="190" y2="100" stroke="#1e293b" strokeWidth="1" />

                    {/* Sensor current beam ray */}
                    {(() => {
                      // Map servoAngle 0 to 90 degrees to radar arc
                      const rad = (Math.PI / 180) * (180 - (telemetry.servoAngle * 2));
                      const rx = 100 + 85 * Math.cos(rad);
                      const ry = 100 - 85 * Math.sin(rad);

                      // Blip position based on measured distance
                      const rDist = Math.min(85, (telemetry.measuredDistance / 100) * 85);
                      const bx = 100 + rDist * Math.cos(rad);
                      const by = 100 - rDist * Math.sin(rad);

                      return (
                        <>
                          <line x1="100" y1="100" x2={rx} y2={ry} stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
                          {isObstaclePresent && (
                            <circle
                              cx={bx}
                              cy={by}
                              r="4"
                              fill={telemetry.status === 'SAFE' ? '#10b981' : telemetry.status === 'WARNING' ? '#f59e0b' : '#ef4444'}
                              className="animate-ping"
                            />
                          )}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                <div className="text-center text-xs font-mono text-slate-400 mt-2">
                  <span>Beam Heading: </span>
                  <span className="text-cyan-400 font-bold">{telemetry.servoAngle}°</span>
                  <span className="text-slate-500"> | Radial Distance: </span>
                  <span className="text-amber-400 font-bold">{telemetry.measuredDistance.toFixed(1)} cm</span>
                </div>
              </div>
            )}

            {activeChartTab === 'calibration' && (
              <div className="w-full flex flex-col justify-between h-full">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-2">
                  <span>Sensor Linearity: Actual vs Measured Distance</span>
                  <span className="text-purple-400 font-semibold">Error: {telemetry.percentageError.toFixed(2)}%</span>
                </div>

                <div className="relative w-full h-[180px] bg-slate-900/60 rounded border border-slate-800 p-2 flex items-center justify-center">
                  <svg viewBox="0 0 200 150" className="w-full h-full">
                    {/* Grid */}
                    <line x1="20" y1="130" x2="190" y2="130" stroke="#334155" strokeWidth="1" />
                    <line x1="20" y1="10" x2="20" y2="130" stroke="#334155" strokeWidth="1" />
                    
                    {/* Ideal y = x line */}
                    <line x1="20" y1="130" x2="180" y2="15" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Standard benchmark points */}
                    {[10, 20, 30, 40, 50, 60, 70, 80].map((d) => {
                      const px = 20 + (d / 80) * 160;
                      const py = 130 - (d / 80) * 115;
                      return (
                        <circle key={d} cx={px} cy={py} r="2.5" fill="#38bdf8" opacity="0.6" />
                      );
                    })}

                    {/* Current operating point */}
                    {(() => {
                      const px = 20 + Math.min(160, (telemetry.actualDistance / 80) * 160);
                      const py = 130 - Math.min(115, (telemetry.measuredDistance / 80) * 115);
                      return (
                        <circle cx={px} cy={py} r="5" fill="#ef4444" className="animate-pulse" />
                      );
                    })()}
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>Dashed: Ideal y = x curve</span>
                  <span>Red dot: Active measurement</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
