import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Waves, 
  Activity, 
  Clock, 
  Calculator, 
  AlertCircle, 
  Layers, 
  Compass, 
  Play, 
  RotateCcw, 
  Download, 
  ChevronRight,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { 
  calculateSpeedOfSound, 
  calculateTimeOfFlight, 
  calculateDistanceFromToF, 
  MATERIALS_DATA, 
  simulateHCSR04Reading 
} from '../../utils/physics';
import { ObstacleMaterial } from '../../types';

export const PhysicsLab: React.FC = () => {
  const {
    telemetry,
    obstacleDistance,
    setObstacleDistance,
    obstacleAngle,
    setObstacleAngle,
    obstacleMaterial,
    setObstacleMaterial,
    temperature,
    setTemperature,
    trials,
    addTrial,
    clearTrials,
    runStandardDistancesBenchmark
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<
    'wave-equation' | 'tof' | 'distance-exp' | 'speed-of-sound' | 'error-analysis' | 'materials' | 'angle'
  >('wave-equation');

  // Interactive Wave Equation State: v = f * lambda
  const [waveFrequency, setWaveFrequency] = useState<number>(40); // kHz
  const [waveWavelength, setWaveWavelength] = useState<number>(8.58); // mm (for 343 m/s and 40 kHz)
  const [waveSpeed, setWaveSpeed] = useState<number>(343); // m/s

  // When frequency changes, compute wavelength: lambda = v / f
  const handleFreqChange = (newFreqKhz: number) => {
    setWaveFrequency(newFreqKhz);
    const speed = calculateSpeedOfSound(temperature);
    // lambda in mm = (speed in m/s) / (freq in kHz * 1000) * 1000 = speed / freq
    const lambdaMm = speed / newFreqKhz;
    setWaveWavelength(Math.round(lambdaMm * 100) / 100);
    setWaveSpeed(Math.round(speed * 10) / 10);
  };

  // Interactive Speed of Sound Calculator Inputs
  const [calcDistanceCm, setCalcDistanceCm] = useState<number>(30);
  const [calcTofUs, setCalcTofUs] = useState<number>(1749);

  // Auto calculate when distance input changes
  const handleCalcDistChange = (dist: number) => {
    setCalcDistanceCm(dist);
    const tof = calculateTimeOfFlight(dist, 343);
    setCalcTofUs(Math.round(tof));
  };

  // Experimental Speed calculation: v = 2d / t
  const expSpeedMs = calcTofUs > 0 ? (2 * (calcDistanceCm / 100)) / (calcTofUs / 1e6) : 0;
  const theoreticalSpeedMs = calculateSpeedOfSound(temperature);
  const speedDifferenceMs = expSpeedMs - theoreticalSpeedMs;
  const speedPercentDiff = theoreticalSpeedMs > 0 ? (Math.abs(speedDifferenceMs) / theoreticalSpeedMs) * 100 : 0;

  // Error Analysis Inputs
  const [errActualDist, setErrActualDist] = useState<number>(25.0);
  const [errMeasuredDist, setErrMeasuredDist] = useState<number>(25.3);

  const absError = Math.round((errMeasuredDist - errActualDist) * 100) / 100;
  const pctError = errActualDist > 0 ? Math.round((Math.abs(absError) / errActualDist) * 10000) / 100 : 0;

  // Particle Displacement Animation Canvas for Longitudinal Waves
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (activeTab !== 'wave-equation') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rows = 12;
      const cols = 55;
      const spacingX = canvas.width / cols;
      const spacingY = canvas.height / (rows + 1);

      // Wave parameters from state
      const k = (2 * Math.PI) / (canvas.width / (waveFrequency / 10)); // spatial frequency
      const omega = waveFrequency * 0.15; // angular speed

      for (let r = 0; r < rows; r++) {
        const y = (r + 1) * spacingY;
        for (let c = 0; c < cols; c++) {
          const baseX = c * spacingX;
          // Longitudinal displacement along X axis!
          // Particles move back and forth along the propagation direction
          const displacement = Math.sin(k * baseX - t * omega) * 14;
          const x = baseX + displacement;

          // Compression density visualization: color changes when particles bunch together
          const gradientVal = Math.cos(k * baseX - t * omega);
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          if (gradientVal > 0.2) {
            ctx.fillStyle = '#38bdf8'; // Compression (High density)
          } else if (gradientVal < -0.2) {
            ctx.fillStyle = '#64748b'; // Rarefaction (Low density)
          } else {
            ctx.fillStyle = '#94a3b8';
          }
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, waveFrequency]);

  // Download Trials CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actual Distance (cm)', 'Measured Distance (cm)', 'ToF (us)', 'Error (cm)', '% Error', 'Servo Angle', 'Material', 'Status'];
    const rows = trials.map((t) => [
      t.timestamp,
      t.actualDistance,
      t.measuredDistance,
      t.timeOfFlight,
      t.error,
      t.percentageError,
      t.servoAngle,
      t.material,
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `echo_shield_experiment_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
          <span>First-Year B.Tech Physics Laboratory</span>
          <span>·</span>
          <span>Acoustics & Time-of-Flight Mechanics</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          PHYSICS OF ULTRASONIC DETECTION LAB
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Explore the exact mathematical equations, wave propagation physics, acoustic reflection mechanics, and experimental error analysis that govern the physical Arduino HC-SR04 prototype.
        </p>

        {/* Tab Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mt-5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('wave-equation')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'wave-equation'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Wave Equation (v = fλ)
          </button>
          <button
            onClick={() => setActiveTab('tof')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'tof'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Time of Flight (ToF)
          </button>
          <button
            onClick={() => setActiveTab('distance-exp')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'distance-exp'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Distance Experiment
          </button>
          <button
            onClick={() => setActiveTab('speed-of-sound')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'speed-of-sound'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Speed of Sound Calculator
          </button>
          <button
            onClick={() => setActiveTab('error-analysis')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'error-analysis'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5. Error Analysis (10 Sources)
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'materials'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            6. Surface Materials
          </button>
          <button
            onClick={() => setActiveTab('angle')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'angle'
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7. Reflection Angle
          </button>
        </div>
      </div>

      {/* 1. WAVE EQUATION & LONGITUDINAL WAVE VISUALIZATION */}
      {activeTab === 'wave-equation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Waves className="w-5 h-5 text-cyan-400" />
                  Longitudinal Sound Wave: Compressions & Rarefactions
                </h3>
                <span className="text-xs font-mono text-cyan-400">f = {waveFrequency} kHz</span>
              </div>
              <p className="text-xs text-slate-300 mb-4">
                Sound is a <strong>mechanical longitudinal wave</strong> in which air molecules oscillate parallel to the direction of propagation. Air molecules oscillate back and forth, creating alternating regions of high pressure (<strong>compressions</strong>) and low pressure (<strong>rarefactions</strong>).
              </p>

              {/* Canvas visualizer */}
              <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-3 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={550}
                  height={150}
                  className="w-full h-[150px] block"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800">
                  <span className="text-cyan-400">● Blue = Compression (High Density / Max Pressure)</span>
                  <span className="text-slate-500">● Grey = Rarefaction (Low Density / Min Pressure)</span>
                </div>
              </div>
            </div>

            {/* Interactive sliders for frequency and wavelength */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Frequency (f):</span>
                  <span className="text-cyan-400 font-bold">{waveFrequency} kHz</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="1"
                  value={waveFrequency}
                  onChange={(e) => handleFreqChange(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block mt-1">HC-SR04 uses 40 kHz (human hearing stops at 20 kHz)</span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>Wavelength (λ):</span>
                  <span className="text-amber-400 font-bold">{waveWavelength} mm</span>
                </div>
                <div className="text-xs text-slate-300 font-mono py-1">
                  λ = v / f = {waveSpeed} / {waveFrequency}000 = <span className="text-amber-400 font-semibold">{waveWavelength} mm</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Short wavelength enables directional, localized beam detection</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                Fundamental Wave Equation
              </h3>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center my-3">
                <div className="text-2xl font-mono font-black text-cyan-300">
                  v = f · λ
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  Wave Velocity = Frequency × Wavelength
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 mt-4">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800/60">
                  <span className="font-semibold text-cyan-400 block mb-0.5">v = Wave Velocity (Speed of Sound)</span>
                  <span>In dry air at 20°C, v ≈ 343 m/s. Determined strictly by the medium properties (bulk modulus B and density ρ: v = √(B/ρ)).</span>
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800/60">
                  <span className="font-semibold text-amber-400 block mb-0.5">f = 40,000 Hz (40 kHz)</span>
                  <span>Set by the piezoelectric crystal resonance in the HC-SR04 transmitter barrel.</span>
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800/60">
                  <span className="font-semibold text-emerald-400 block mb-0.5">λ = 8.58 mm</span>
                  <span>Because the wavelength is small (~8.6 mm), sound does not heavily diffract around large objects, enabling specular reflection and directional obstacle detection!</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <strong>Connection to Prototype:</strong> The Arduino code triggers an 8-cycle burst of this 40 kHz square wave through the ultrasonic transducer.
            </div>
          </div>
        </div>
      )}

      {/* 2. TIME OF FLIGHT (ToF) VISUALIZATION */}
      {activeTab === 'tof' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Time of Flight (ToF) Sequence Breakdown
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                The ultrasonic module calculates distance by measuring the round-trip travel time of sound through air:
              </p>

              {/* Step sequence */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-900/60 text-cyan-400 flex items-center justify-center font-bold text-xs">1</span>
                    <span>1. Arduino Trigger Pulse</span>
                  </div>
                  <span className="text-cyan-400">10 μs HIGH on Trig pin</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-900/60 text-cyan-400 flex items-center justify-center font-bold text-xs">2</span>
                    <span>2. Sonic Burst Emission (T)</span>
                  </div>
                  <span className="text-cyan-400">8 pulses at 40 kHz</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-900/60 text-amber-400 flex items-center justify-center font-bold text-xs">3</span>
                    <span>3. Propagation to Obstacle</span>
                  </div>
                  <span className="text-amber-400">Travels at v = 343 m/s</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-900/60 text-amber-400 flex items-center justify-center font-bold text-xs">4</span>
                    <span>4. Reflection & Echo Return</span>
                  </div>
                  <span className="text-amber-400">Specular acoustic reflection</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-400 flex items-center justify-center font-bold text-xs">5</span>
                    <span>5. Receiver Detection (R)</span>
                  </div>
                  <span className="text-emerald-400">Echo pin goes LOW</span>
                </div>
              </div>
            </div>

            {/* Interactive distance / ToF slider */}
            <div className="mt-5 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Set Obstacle Distance (d):</span>
                <span className="text-cyan-400 font-bold">{obstacleDistance} cm</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="1"
                value={obstacleDistance}
                onChange={(e) => setObstacleDistance(parseInt(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                Time-of-Flight Equation
              </h3>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center my-2">
                <div className="text-2xl font-mono font-black text-emerald-300">
                  d = (v · t) / 2
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Factor of 2 accounts for round-trip path (Sensor → Obstacle → Sensor)
                </div>
              </div>

              {/* Dynamic Math Substitution */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                <div className="text-slate-400 font-semibold border-b border-slate-800 pb-1">
                  Live Mathematical Evaluation:
                </div>
                <div>v = {telemetry.speedOfSound} m/s = 0.0343 cm/μs</div>
                <div>t = {telemetry.timeOfFlight} μs</div>
                <div className="pt-1 text-cyan-300">
                  d = ({telemetry.speedOfSound} × {telemetry.timeOfFlight * 1e-6}) / 2
                </div>
                <div className="text-emerald-400 font-bold text-sm">
                  d ≈ {( (telemetry.speedOfSound * telemetry.timeOfFlight * 1e-6) / 2 * 100 ).toFixed(1)} cm
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-blue-950/30 border border-blue-900/50 text-xs text-slate-300">
                <strong className="text-cyan-300 block mb-1">Arduino pulseIn() Shortcut:</strong>
                <span>
                  d (cm) = duration / 58.2<br />
                  Because 1 / (0.0343 / 2) = 58.309 μs per centimeter!
                </span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              Speed of Sound used: {telemetry.speedOfSound} m/s at {temperature}°C
            </div>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE DISTANCE EXPERIMENT */}
      {activeTab === 'distance-exp' && (
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Virtual Distance Calibration Bench (10 cm to 80 cm)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Run trials at standardized distances to benchmark HC-SR04 linearity, Time of Flight, and sensor timing accuracy.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={runStandardDistancesBenchmark}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Standard Benchmark (10–80 cm)</span>
              </button>
              <button
                onClick={() => addTrial()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <span>Record Current Live Point</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={clearTrials}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear Data Log"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick preset distance buttons */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono">
            <span className="text-slate-400">Quick Distance Jump:</span>
            {[10, 20, 30, 40, 50, 60, 70, 80].map((d) => (
              <button
                key={d}
                onClick={() => setObstacleDistance(d)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  obstacleDistance === d
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {d} cm
              </button>
            ))}
          </div>

          {/* Experimental Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Actual Distance</th>
                    <th className="p-3">Time of Flight (ToF)</th>
                    <th className="p-3">Calculated Distance</th>
                    <th className="p-3">Absolute Error</th>
                    <th className="p-3">% Error</th>
                    <th className="p-3">Material</th>
                    <th className="p-3">Safety Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {trials.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-400">{t.timestamp}</td>
                      <td className="p-3 font-semibold text-cyan-400">{t.actualDistance} cm</td>
                      <td className="p-3 text-amber-400">{t.timeOfFlight} μs</td>
                      <td className="p-3 text-emerald-400 font-bold">{t.measuredDistance.toFixed(1)} cm</td>
                      <td className="p-3 text-purple-400">
                        {t.error > 0 ? `+${t.error.toFixed(2)}` : t.error.toFixed(2)} cm
                      </td>
                      <td className="p-3 text-purple-400 font-bold">{t.percentageError.toFixed(2)}%</td>
                      <td className="p-3 capitalize text-slate-300">{t.material}</td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            t.status === 'SAFE'
                              ? 'text-emerald-400'
                              : t.status === 'WARNING'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SPEED OF SOUND CALCULATOR */}
      {activeTab === 'speed-of-sound' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                Experimental Speed of Sound Calculator
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                Calculate the experimental acoustic velocity by rearranging the Time-of-Flight equation:
              </p>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center mb-4">
                <div className="text-2xl font-mono font-black text-cyan-300">
                  v = 2d / t
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  Speed = (2 × Known Distance) / Measured Time of Flight
                </div>
              </div>

              {/* Calculator Inputs */}
              <div className="space-y-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Known Distance (d):</span>
                    <span className="text-cyan-400 font-bold">{calcDistanceCm} cm</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={calcDistanceCm}
                    onChange={(e) => handleCalcDistChange(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Measured Time of Flight (t):</span>
                    <span className="text-amber-400 font-bold">{calcTofUs} μs</span>
                  </div>
                  <input
                    type="number"
                    value={calcTofUs}
                    onChange={(e) => setCalcTofUs(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Ambient Air Temperature:</span>
                    <span className="text-emerald-400 font-bold">{temperature}°C</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="45"
                    step="1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Comparison with Theoretical Reference
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Experimental Value (v_exp)</span>
                  <div className="text-xl font-black font-mono text-cyan-400 mt-1">
                    {expSpeedMs.toFixed(1)} <span className="text-xs text-slate-400">m/s</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">(2 × {calcDistanceCm} cm) / {calcTofUs} μs</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Theoretical Reference at {temperature}°C</span>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                    {theoreticalSpeedMs.toFixed(1)} <span className="text-xs text-slate-400">m/s</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">v(T) = 331.3 × √(1 + T/273.15)</span>
                </div>
              </div>

              {/* Differences */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Absolute Difference (Δv):</span>
                  <span className={speedDifferenceMs >= 0 ? 'text-amber-400' : 'text-purple-400'}>
                    {speedDifferenceMs >= 0 ? `+${speedDifferenceMs.toFixed(2)}` : speedDifferenceMs.toFixed(2)} m/s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Percentage Difference:</span>
                  <span className="text-purple-400 font-bold">{speedPercentDiff.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <strong className="text-slate-200 block mb-0.5">Physics Insight:</strong>
              As temperature rises, kinetic energy of air molecules increases, meaning acoustic pressure pulses transmit faster between gas particles.
            </div>
          </div>
        </div>
      )}

      {/* 5. ERROR ANALYSIS (10 PHYSICAL SOURCES) */}
      {activeTab === 'error-analysis' && (
        <div className="flex flex-col gap-5">
          {/* Interactive Error Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-400" />
                Percentage Error Calculator
              </h3>
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-xs text-slate-300 mb-3">
                <span className="text-purple-300 font-bold text-sm block mb-1">
                  % Error = (|Measured − Actual| / Actual) × 100
                </span>
                <span>Quantifies deviation of ultrasonic reading from physical ground truth</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Actual Distance (cm):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={errActualDist}
                    onChange={(e) => setErrActualDist(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Measured Distance (cm):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={errMeasuredDist}
                    onChange={(e) => setErrMeasuredDist(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex justify-around">
                <div>
                  <span className="text-slate-400 text-[10px] block">Absolute Error</span>
                  <span className="text-base font-bold text-purple-400">
                    {absError > 0 ? `+${absError.toFixed(2)}` : absError.toFixed(2)} cm
                  </span>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-slate-400 text-[10px] block">Percentage Error</span>
                  <span className="text-base font-bold text-purple-400">{pctError.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <h3 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-400" />
                Physical Error Budget
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                In experimental First-Year Physics laboratory measurements, errors are categorized into systematic errors (calibration, speed of sound temperature drift) and random errors (timing jitter, air currents).
              </p>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>Sensor Nominal Accuracy:</span>
                  <span className="text-cyan-400">±0.3 cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Arduino pulseIn() Jitter:</span>
                  <span className="text-amber-400">±2 to 4 μs (±0.07 cm)</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperature Drift per °C:</span>
                  <span className="text-emerald-400">~0.17% error per °C</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed 10 Error Sources Grid */}
          <div className="rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
            <h4 className="font-bold text-sm text-slate-100 mb-3 uppercase tracking-wider text-cyan-400">
              10 Physical Sources of Measurement Error in the Prototype
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: '1. Sensor Resolution Limit', desc: 'HC-SR04 has an intrinsic physical spatial resolution of ~0.3 cm governed by transducer response time and ring-down envelope.' },
                { title: '2. Microcontroller Timing Jitter', desc: 'Arduino ATmega328P uses 16MHz clock. Interrupts and micros()/pulseIn() loop quantization introduce ±2 to 4 μs jitter.' },
                { title: '3. Sensor Beam Spread (15° Cone)', desc: 'The acoustic beam radiates in a ~15° cone. Reflections can occur from side objects or track edges rather than the target center.' },
                { title: '4. Sensor Alignment & Tilt', desc: 'If the HC-SR04 barrels are not perfectly parallel to the railway bed, the incident beam measures a hypotenuse distance (d / cos θ).' },
                { title: '5. Object Orientation Angle', desc: 'Non-perpendicular obstacles cause specular acoustic reflection away from the receiver cylinder, attenuating echo amplitude.' },
                { title: '6. Surface Material Impedance', desc: 'Porous materials (foam, fabrics) absorb 40 kHz sound waves, weakening echo detection threshold and delaying trigger threshold.' },
                { title: '7. Surface Roughness & Scattering', desc: 'Rough surfaces cause diffuse acoustic scattering rather than specular reflection, lowering returned wave intensity.' },
                { title: '8. Multipath Reflections', desc: 'Acoustic pulses may bounce between rails, ground, and train carriage before reaching the receiver, registering false elongated ToF.' },
                { title: '9. Air Movement & Turbulence', desc: 'Drafts, laboratory fans, or convective thermal gradients alter the effective speed of sound and bend sound rays.' },
                { title: '10. Servo Motor Backlash', desc: 'The SG90 micro-servo gear train possesses ~1° to 2° mechanical backlash, introducing slight positional uncertainty in angular indexing.' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                  <span className="font-semibold text-slate-200 block mb-1 text-cyan-300">{item.title}</span>
                  <span className="text-slate-400">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. SURFACE REFLECTION EXPERIMENT */}
      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                Acoustic Impedance & Material Reflection
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                When an ultrasonic sound wave encounters a boundary between air (medium 1) and an obstacle (medium 2), reflection is governed by <strong>specific acoustic impedance</strong>:
              </p>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-xs mb-4">
                <span className="text-amber-300 font-bold block mb-1">
                  Z = ρ · v &nbsp;|&nbsp; R = ((Z₂ − Z₁) / (Z₂ + Z₁))²
                </span>
                <span className="text-slate-400 text-[10px]">
                  Z₁ (Air) ≈ 415 Rayls. Large impedance mismatch causes near-total specular reflection.
                </span>
              </div>

              {/* Material selector */}
              <div className="space-y-2">
                {(['metal', 'plastic', 'wood', 'cardboard', 'foam'] as ObstacleMaterial[]).map((matKey) => {
                  const m = MATERIALS_DATA[matKey];
                  return (
                    <button
                      key={matKey}
                      onClick={() => setObstacleMaterial(matKey)}
                      className={`w-full p-3 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                        obstacleMaterial === matKey
                          ? 'bg-slate-800 border-cyan-500 shadow-md text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: m.color }} />
                        <div>
                          <span className="font-semibold block">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Reflectivity: {(m.reflectivity * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-slate-100">
                  Selected Material: <span className="text-cyan-400">{MATERIALS_DATA[obstacleMaterial].name}</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Texture: {MATERIALS_DATA[obstacleMaterial].roughness}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  {MATERIALS_DATA[obstacleMaterial].description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 font-mono">
                  <div className="p-2 bg-slate-900 rounded">
                    <span className="text-[10px] text-slate-400 block">Density (ρ)</span>
                    <span className="font-bold text-slate-200">{MATERIALS_DATA[obstacleMaterial].density} kg/m³</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded">
                    <span className="text-[10px] text-slate-400 block">Internal Speed (v)</span>
                    <span className="font-bold text-slate-200">{MATERIALS_DATA[obstacleMaterial].soundSpeed} m/s</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded">
                    <span className="text-[10px] text-slate-400 block">Acoustic Impedance</span>
                    <span className="font-bold text-amber-400">{MATERIALS_DATA[obstacleMaterial].acousticImpedance.toExponential(1)} Rayls</span>
                  </div>
                </div>

                {/* Experimental reflection strength meter */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Echo Return Signal Strength:</span>
                    <span className="text-cyan-400 font-bold">
                      {(MATERIALS_DATA[obstacleMaterial].reflectivity * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${MATERIALS_DATA[obstacleMaterial].reflectivity * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90">
              <strong>Laboratory Note:</strong> Ultrasonic reflection varies with surface hardness, roughness, orientation, and size. We present this as an experimental observation rather than an absolute binary rule.
            </div>
          </div>
        </div>
      )}

      {/* 7. OBJECT REFLECTION ANGLE EXPERIMENT */}
      {activeTab === 'angle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                Law of Reflection & Specular Wave Bouncing
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                Like light, ultrasound obeys the <strong>Law of Reflection</strong>: <em>Angle of Incidence = Angle of Reflection (θᵢ = θᵣ)</em>.
              </p>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
                <svg viewBox="0 0 240 130" className="w-full h-32">
                  {/* Obstacle surface */}
                  <g transform={`rotate(${obstacleAngle}, 120, 90)`}>
                    <line x1="80" y1="90" x2="160" y2="90" stroke="#38bdf8" strokeWidth="4" />
                    <line x1="120" y1="90" x2="120" y2="30" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
                  </g>

                  {/* Incident ray */}
                  <line x1="120" y1="120" x2="120" y2="90" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="125" y="115" fill="#22c55e" fontSize="9" fontFamily="monospace">Incident</text>

                  {/* Reflected ray bounced at 2 * obstacleAngle */}
                  {(() => {
                    const rad = (Math.PI / 180) * (90 - obstacleAngle * 2);
                    const rx = 120 + 55 * Math.cos(rad);
                    const ry = 90 - 55 * Math.sin(rad);
                    return (
                      <line x1="120" y1="90" x2={rx} y2={ry} stroke="#f59e0b" strokeWidth="2" />
                    );
                  })()}
                </svg>

                <span className="text-[11px] font-mono text-slate-400 mt-1">
                  At θ = 0° (Normal incidence), reflected beam returns directly to receiver cylinder.
                </span>
              </div>

              {/* Angle presets */}
              <div className="mt-4">
                <span className="text-xs text-slate-400 block mb-2">Preset Obstacle Angles:</span>
                <div className="flex gap-2">
                  {[0, 15, 30, 45, 60].map((ang) => (
                    <button
                      key={ang}
                      onClick={() => setObstacleAngle(ang)}
                      className={`flex-1 py-1.5 rounded text-xs font-mono transition-colors ${
                        obstacleAngle === ang
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {ang}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-100 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Echo Energy Returning to HC-SR04
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-slate-400">Effective Echo Return Energy:</span>
                    <span className="text-amber-400 font-bold">
                      {(Math.max(0, Math.cos((obstacleAngle * Math.PI) / 180)) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                      style={{ width: `${Math.max(0, Math.cos((obstacleAngle * Math.PI) / 180)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">At 0° (Favorable Orientation):</strong>
                  <span>The incident wave strikes perpendicularly. The specular reflection bounces directly back into the 15° acceptance cone of the receiver barrel.</span>
                </div>

                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <strong className="text-rose-400 block mb-1">At &gt;30° (Unfavorable Orientation):</strong>
                  <span>The reflected sound wave is deflected completely away from the sensor aperture. The HC-SR04 receiver misses the echo, causing the sensor to time out and report &gt;400 cm (no obstacle detected).</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <strong>Railway Engineering Relevance:</strong> Explains why flat obstacle surfaces (like a stalled wagon or square rock) are detected reliably, whereas sharp wedge-shaped obstacles may deflect ultrasound.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
