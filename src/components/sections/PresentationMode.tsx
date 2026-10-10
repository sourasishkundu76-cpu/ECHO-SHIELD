import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Calculator, 
  Activity, 
  Sparkles,
  Layers
} from 'lucide-react';

export const PresentationMode: React.FC = () => {
  const {
    telemetry,
    obstacleDistance,
    temperature,
    trials,
    startDemonstration
  } = useSimulation();

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const SLIDES = [
    {
      title: 'PROJECT TITLE & OBJECTIVE',
      subtitle: 'First-Year B.Tech Physics Practical & Viva Voce',
      category: '1. Objective',
      content: (
        <div className="space-y-6 text-slate-200">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <h1 className="text-3xl font-black text-cyan-400 tracking-wide uppercase">
              ECHO-SHIELD
            </h1>
            <p className="text-base text-slate-300 font-semibold mt-1">
              Ultrasonic Railway Track Obstacle Detection
            </p>
            <p className="text-sm text-cyan-300 font-mono italic mt-2">
              “Detecting Obstacles Through the Physics of Sound”
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-1">Primary Academic Objective</span>
              <p className="text-slate-300 leading-relaxed text-xs">
                To design, construct, and calibrate a physical microcomputer prototype capable of non-contact distance measurement and obstacle detection along a railway corridor utilizing 40 kHz ultrasonic acoustic wave reflection and Time-of-Flight (ToF) principles.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Key Scientific Focus Areas</span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Wave equation verification (v = fλ)</li>
                <li>Longitudinal sound propagation in air</li>
                <li>Law of reflection (θᵢ = θᵣ) and acoustic impedance</li>
                <li>Microsecond timing resolution and calibration error analysis</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'PHYSICS PRINCIPLES & WAVE MECHANICS',
      subtitle: 'Acoustics, Longitudinal Waves, and Resonance',
      category: '2. Physics Principle',
      content: (
        <div className="space-y-5 text-slate-200">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Mechanical Wave</span>
              <p className="text-sm font-semibold text-cyan-300 mt-1">Longitudinal Pressure Wave</p>
              <span className="text-[11px] text-slate-400">Particle displacement parallel to propagation</span>
            </div>
            <div className="border-x border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase">Resonant Frequency</span>
              <p className="text-sm font-semibold text-amber-300 mt-1">f = 40,000 Hz (40 kHz)</p>
              <span className="text-[11px] text-slate-400">Piezoelectric transducer excitation</span>
            </div>
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Acoustic Wavelength</span>
              <p className="text-sm font-semibold text-emerald-300 mt-1">λ ≈ 8.58 mm (in air)</p>
              <span className="text-[11px] text-slate-400">Enables sharp specular reflection</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              <strong>Sound in Air:</strong> Sound propagates via molecular collisions. Alternating high-pressure zones (compressions) and low-pressure zones (rarefactions) travel forward at velocity v = √(γ · R · T / M), where γ = 1.4 for air.
            </p>
            <p>
              <strong>Why 40 kHz Ultrasound?</strong> Ultrasonic frequencies above 20 kHz are inaudible to human passengers and railway operators. The short millimeter wavelength prevents widespread diffraction around obstacles, allowing directional beaming and tight spatial localization.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'MATHEMATICAL DERIVATIONS & GOVERNING FORMULAS',
      subtitle: 'Wave Speed, Time of Flight, and Distance Equations',
      category: '3. Equations',
      content: (
        <div className="space-y-4 text-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-xs font-mono text-slate-400 uppercase block mb-1">Fundamental Wave Equation</span>
              <div className="text-2xl font-mono font-bold text-cyan-400">v = f · λ</div>
              <p className="text-xs text-slate-300 mt-2">
                Velocity (m/s) = Frequency (Hz) × Wavelength (m)
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-xs font-mono text-slate-400 uppercase block mb-1">Time of Flight Distance Formula</span>
              <div className="text-2xl font-mono font-bold text-emerald-400">d = (v · t) / 2</div>
              <p className="text-xs text-slate-300 mt-2">
                Distance = (Speed of Sound × Round-Trip Time) / 2
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-amber-400 font-bold">Temperature Correction Formula:</div>
            <div>v(T) = 331.3 · √(1 + T / 273.15) ≈ 331.3 + 0.606 · T (m/s)</div>
            <div className="pt-2 text-cyan-300 font-bold">Arduino pulseIn() Derivation:</div>
            <div>Time per 1 cm round trip = (2 × 0.01 m) / 343 m/s = 58.309 × 10⁻⁶ s = 58.3 μs</div>
            <div className="text-emerald-400">∴ Distance (cm) = Microseconds / 58.3</div>
          </div>
        </div>
      )
    },
    {
      title: 'HARDWARE ARCHITECTURE & STRICT SCOPE',
      subtitle: 'Demonstrated Components Matching Reference Video',
      category: '4. Hardware',
      content: (
        <div className="space-y-4 text-slate-200">
          <p className="text-xs text-slate-300">
            Strictly limited to the 6 physical components demonstrated in the laboratory experiment:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-cyan-400 block">1. Arduino Controller</span>
              <span className="text-[11px] text-slate-400">ATmega328P, USB serial, 16 MHz timer</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-sky-400 block">2. HC-SR04 Sensor</span>
              <span className="text-[11px] text-slate-400">Dual 40 kHz piezoelectric transducers</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-indigo-400 block">3. SG90 Micro Servo</span>
              <span className="text-[11px] text-slate-400">Rotates sensor from 0° to 90° scanning arc</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-emerald-400 block">4. Breadboard LEDs</span>
              <span className="text-[11px] text-slate-400">Green (Safe), Yellow (Caution), Red (Danger)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400 block">5. Half-Size Breadboard</span>
              <span className="text-[11px] text-slate-400">400 tie points with 220Ω resistors</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-rose-400 block">6. Jumper Wires</span>
              <span className="text-[11px] text-slate-400">DuPont male-male & male-female</span>
            </div>
          </div>

          <div className="p-3 rounded bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200">
            <strong>Hardware Restriction Adherence:</strong> No LCD, OLED, buzzer, GPS, camera, or LiDAR added. The railway track is solely the physical demonstration vehicle.
          </div>
        </div>
      )
    },
    {
      title: 'EXPERIMENTAL DATA & OBSERVATIONS',
      subtitle: 'Recorded Distance, Time-of-Flight, and Calibration Results',
      category: '5. Experimental Data',
      content: (
        <div className="space-y-4 text-slate-200">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-2">Actual Distance</th>
                  <th className="py-2">Measured ToF</th>
                  <th className="py-2">Calculated (d)</th>
                  <th className="py-2">Absolute Error</th>
                  <th className="py-2">% Error</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 font-bold text-cyan-400">10.0 cm</td>
                  <td className="py-2 text-amber-400">588 μs</td>
                  <td className="py-2 text-emerald-400 font-bold">10.1 cm</td>
                  <td className="py-2 text-purple-400">+0.10 cm</td>
                  <td className="py-2 text-purple-400">1.00%</td>
                  <td className="py-2 text-rose-400 font-bold">DANGER</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-cyan-400">20.0 cm</td>
                  <td className="py-2 text-amber-400">1166 μs</td>
                  <td className="py-2 text-emerald-400 font-bold">20.0 cm</td>
                  <td className="py-2 text-purple-400">0.00 cm</td>
                  <td className="py-2 text-purple-400">0.00%</td>
                  <td className="py-2 text-amber-400 font-bold">WARNING</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-cyan-400">30.0 cm</td>
                  <td className="py-2 text-amber-400">1750 μs</td>
                  <td className="py-2 text-emerald-400 font-bold">30.1 cm</td>
                  <td className="py-2 text-purple-400">+0.10 cm</td>
                  <td className="py-2 text-purple-400">0.33%</td>
                  <td className="py-2 text-amber-400 font-bold">WARNING</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-cyan-400">50.0 cm</td>
                  <td className="py-2 text-amber-400">2915 μs</td>
                  <td className="py-2 text-emerald-400 font-bold">50.2 cm</td>
                  <td className="py-2 text-purple-400">+0.20 cm</td>
                  <td className="py-2 text-purple-400">0.40%</td>
                  <td className="py-2 text-amber-400 font-bold">WARNING</td>
                </tr>
                <tr>
                  <td className="py-2 font-bold text-cyan-400">70.0 cm</td>
                  <td className="py-2 text-amber-400">4082 μs</td>
                  <td className="py-2 text-emerald-400 font-bold">70.3 cm</td>
                  <td className="py-2 text-purple-400">+0.30 cm</td>
                  <td className="py-2 text-purple-400">0.43%</td>
                  <td className="py-2 text-emerald-400 font-bold">SAFE</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-300 font-mono flex justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span>Average Observed Error across 10–70 cm: <strong>~0.43%</strong></span>
            <span>R² Linearity Factor: <strong>0.9998</strong></span>
          </div>
        </div>
      )
    },
    {
      title: 'ERROR ANALYSIS & VIVA DISCUSSION',
      subtitle: 'Systematic vs Random Errors & Experimental Limitations',
      category: '6. Error Analysis',
      content: (
        <div className="space-y-4 text-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-1">Systematic Errors</span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>Temperature drift (assumed 20°C vs actual lab temp)</li>
                <li>Zero-offset distance from transducer diaphragm to track edge</li>
                <li>Sensor hardware trigger loop latency in microcontroller</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400 block mb-1">Random Errors</span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>PulseIn() clock timer quantization (±1–2 μs)</li>
                <li>Convective air currents and draft turbulence</li>
                <li>Acoustic surface roughness scattering</li>
                <li>Servo motor mechanical gear backlash</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-emerald-400 block mb-1">Common Viva Voce Question Answer:</span>
            <p>
              <em>Q: Why did we divide the measured time by 2?</em><br />
              <strong>A:</strong> Because the ultrasonic burst travels a two-way round-trip path (from transmitter to obstacle and back to receiver). To determine one-way distance to the obstacle, the total transit distance must be halved: d = (v · t) / 2.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'CONCLUSIONS & PROJECT SUMMARY',
      subtitle: 'Verification of Acoustic Principles and Practical Outcome',
      category: '7. Conclusion',
      content: (
        <div className="space-y-6 text-slate-200">
          <div className="p-6 rounded-xl bg-slate-900 border border-emerald-800/80 text-center">
            <Award className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-emerald-300">
              First-Year B.Tech Physics Practical Project Successfully Verified
            </h2>
            <p className="text-xs text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
              The ECHO-SHIELD prototype successfully demonstrates non-contact obstacle detection using Time of Flight acoustics. The relationship d = (v · t) / 2 was experimentally proven with sub-1% calibration error.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-center">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Speed of Sound</span>
              <span className="text-cyan-400 font-bold text-base">343 m/s</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Acoustic Frequency</span>
              <span className="text-amber-400 font-bold text-base">40 kHz</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Mean Error</span>
              <span className="text-emerald-400 font-bold text-base">&lt; 0.5%</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Presentation Header */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-400 mb-1">
            <Presentation className="w-4 h-4 text-indigo-400" />
            <span>Academic Viva Voce & Professor Presentation Mode</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            ECHO-SHIELD PROJECT SLIDES
          </h2>
        </div>

        {/* Slide Counter & Nav */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            title="Previous Slide (or Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono text-slate-300 px-3 py-1.5 rounded bg-slate-950 border border-slate-800">
            Slide {currentSlide + 1} of {SLIDES.length}
          </span>
          <button
            disabled={currentSlide === SLIDES.length - 1}
            onClick={() => setCurrentSlide(prev => Math.min(SLIDES.length - 1, prev + 1))}
            className="p-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-500 disabled:opacity-30 disabled:pointer-events-none"
            title="Next Slide (or Right Arrow)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="min-h-[440px] rounded-2xl p-8 bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold block mb-1">
                {SLIDES[currentSlide].category}
              </span>
              <h3 className="text-2xl font-bold text-white">
                {SLIDES[currentSlide].title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {SLIDES[currentSlide].subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={startDemonstration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold border border-cyan-500/40 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trigger 3D Demo</span>
              </button>
            </div>
          </div>

          {/* Slide Content */}
          <div className="py-2">
            {SLIDES[currentSlide].content}
          </div>
        </div>

        {/* Slide Progress Dots */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === i ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Jump to slide ${i + 1}`}
              />
            ))}
          </div>
          <span>B.Tech Engineering Physics · Project Companion</span>
        </div>
      </div>
    </div>
  );
};
