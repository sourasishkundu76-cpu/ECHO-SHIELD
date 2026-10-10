import React, { useState } from 'react';
import { 
  Waves, 
  Activity, 
  Clock, 
  Compass, 
  Radio, 
  Lightbulb, 
  Layers, 
  Zap, 
  Cpu, 
  Thermometer, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

export const PhysicsConceptsSection: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<number>(0);

  const CONCEPTS = [
    {
      title: 'Mechanical Waves',
      subtitle: 'Energy transfer through material media via particle oscillation',
      equation: 'E ∝ A² · f²',
      equationLabel: 'Wave Energy is proportional to amplitude squared and frequency squared',
      explanation:
        'A mechanical wave is a disturbance that travels through an elastic medium (such as air, water, or steel) by transferring kinetic energy from one oscillating molecule to its adjacent neighbors, without net transport of matter.',
      prototypeConnection:
        'The HC-SR04 cannot operate in a vacuum. It relies strictly on air molecules in the room to conduct the mechanical pressure vibrations from the transducer to the obstacle and back.',
      keyTakeaway: 'Requires a material medium with inertia and elasticity.'
    },
    {
      title: 'Sound Waves',
      subtitle: 'Acoustic pressure fluctuations within the audible and inaudible spectrum',
      equation: 'I = p_rms² / (ρ · v)',
      equationLabel: 'Acoustic Intensity in terms of RMS acoustic pressure',
      explanation:
        'Sound is the propagation of acoustic pressure waves. Audible sound spans 20 Hz to 20 kHz. Below 20 Hz is infrasound; above 20 kHz is ultrasound. Sound waves obey all classical wave laws: reflection, refraction, interference, and diffraction.',
      prototypeConnection:
        'The Arduino project operates at 40 kHz, placing it well above human hearing limits, preventing annoying audible buzzing during continuous operation.',
      keyTakeaway: 'Characterized by frequency, amplitude, period, and speed.'
    },
    {
      title: 'Longitudinal Waves',
      subtitle: 'Oscillation direction parallel to the wave propagation axis',
      equation: 'y(x, t) = A · sin(kx − ωt)',
      equationLabel: '1D Longitudinal Displacement Equation',
      explanation:
        'In longitudinal waves, particles oscillate back and forth along the same direction the wave travels. This generates regions of compressed particles (compressions / high density) and expanded particles (rarefactions / low density).',
      prototypeConnection:
        'Air supports only longitudinal waves because fluids lack shear modulus (cannot support transverse shear waves).',
      keyTakeaway: 'Compressions + Rarefactions form the periodic wave train.'
    },
    {
      title: 'Ultrasonic Waves (40 kHz)',
      subtitle: 'High-frequency acoustic vibrations above 20,000 Hz',
      equation: 'f_res = 40,000 Hz (40 kHz)',
      equationLabel: 'Piezoelectric mechanical resonance frequency',
      explanation:
        'Ultrasonic waves have very short wavelengths (λ ≈ 8.6 mm in air at 40 kHz). Short wavelengths result in minimal diffraction around obstacles, producing narrow, directional acoustic beams that bounce specularly off solid boundaries.',
      prototypeConnection:
        'The HC-SR04 transmitter contains a piezoelectric disc designed to resonate precisely at 40 kHz, maximizing emitted acoustic power.',
      keyTakeaway: 'High directivity and low diffraction enable targeted obstacle detection.'
    },
    {
      title: 'Acoustic Reflection',
      subtitle: 'Wave bouncing at the boundary between two different media',
      equation: 'θ_incident = θ_reflected (θᵢ = θᵣ)',
      equationLabel: 'Law of Reflection',
      explanation:
        'When an acoustic wave hits an obstacle, part of the wave reflects and part transmits. The fraction of reflected energy depends on the mismatch in specific acoustic impedance Z = ρ · v between air and the obstacle.',
      prototypeConnection:
        'Because railway obstacles (wood, metal, plastic) have acoustic impedances thousand of times higher than air, over 98% of the ultrasonic wave energy reflects at the surface.',
      keyTakeaway: 'Impedance mismatch creates strong specular reflections.'
    },
    {
      title: 'Echo Phenomenon',
      subtitle: 'Sound reflected from a distant surface arriving back at the source',
      equation: 'Δt = 2d / v  (for Δt ≥ 0.1 s in human hearing)',
      equationLabel: 'Echo arrival delay condition',
      explanation:
        'An echo is the acoustic repetition of a sound caused by reflection off a distant boundary. For humans, an echo is distinct only if delay exceeds 0.1 seconds. Electronic sensors, however, can detect microsecond-delayed echoes.',
      prototypeConnection:
        'The HC-SR04 receiver barrel is an acoustic microphone tuned to 40 kHz that detects the faint returning echo pulse.',
      keyTakeaway: 'Echo return is the basis of nature’s echolocation (bats/dolphins).'
    },
    {
      title: 'Time of Flight (ToF)',
      subtitle: 'Elapsed duration for a pulse to traverse the transit path',
      equation: 't = t_received − t_transmitted',
      equationLabel: 'Total transit duration in microseconds (μs)',
      explanation:
        'Time of Flight measures the exact time taken by a wave pulse to travel from emitter, reflect off a target, and return to receiver. Modern digital microcontrollers measure this using hardware timer counters clocked at MHz speeds.',
      prototypeConnection:
        'Arduino ATmega328P uses the pulseIn() function, counting timer ticks to measure the Echo pin pulse width in microseconds.',
      keyTakeaway: 'Replaces physical tape measures with microsecond clocks.'
    },
    {
      title: 'Speed of Sound in Air',
      subtitle: 'Thermodynamic propagation speed of acoustic pressure disturbances',
      equation: 'v = √(γ · R · T / M) ≈ 331.3 + 0.606 · T (°C)',
      equationLabel: 'Laplace Speed of Sound Formula in Ideal Gas',
      explanation:
        'Newton originally assumed isothermal sound propagation; Laplace corrected it to adiabatic (no heat exchange during rapid compressions). Speed depends solely on gas temperature: at 20°C in dry air, v = 343.2 m/s.',
      prototypeConnection:
        'Our project calibration uses v = 343 m/s (0.0343 cm/μs), which yields the constant 58.2 μs/cm.',
      keyTakeaway: 'Increases with temperature by ~0.6 m/s per degree Celsius.'
    },
    {
      title: 'Distance Measurement',
      subtitle: 'Conversion of round-trip time into 1D spatial distance',
      equation: 'd = (v · t) / 2',
      equationLabel: 'Fundamental ultrasonic ranging equation',
      explanation:
        'Because the ultrasonic wave travels to the obstacle and returns to the sensor, the total travel distance is 2d. Dividing the product of speed and time by 2 yields the physical target distance.',
      prototypeConnection:
        'The core Arduino code line: float distance = (duration * 0.0343) / 2.0; delivers this calculation in real time.',
      keyTakeaway: 'The factor of 2 is the most common student calculation check.'
    },
    {
      title: 'Wave Propagation',
      subtitle: 'Phase, group velocity, and wavepacket transmission',
      equation: 'v_phase = ω / k = f · λ',
      equationLabel: 'Phase velocity of harmonic wave packet',
      explanation:
        'The HC-SR04 emits an 8-cycle wavepacket. As the wavepacket travels through air, it spreads slightly over distance (conical dispersion) while maintaining its central frequency of 40 kHz.',
      prototypeConnection:
        'The 15-degree cone angle allows the sensor to detect objects slightly to the side of the track without requiring millimeter precision alignment.',
      keyTakeaway: 'Beam dispersion provides a safety clearance cone.'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Undergraduate Physics Curriculum</span>
          <span>·</span>
          <span>10 Core Scientific Concepts</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          PHYSICS CONCEPTS DIRECTORY
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl">
          Comprehensive scientific reference linking classroom physics principles directly to the physical Arduino, HC-SR04, servo motor, and LEDs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Concept Selector List (Left) */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          {CONCEPTS.map((c, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedConcept(idx)}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                selectedConcept === idx
                  ? 'bg-slate-800 border-cyan-500 shadow-md text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <span className="font-bold text-xs block">{c.title}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{c.equation}</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${selectedConcept === idx ? 'text-cyan-400' : 'text-slate-600'}`} />
            </button>
          ))}
        </div>

        {/* Selected Concept Deep Dive (Right) */}
        <div className="lg:col-span-7 rounded-xl p-6 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
                  Physics Concept #{selectedConcept + 1}
                </span>
                <h3 className="text-xl font-bold text-white">
                  {CONCEPTS[selectedConcept].title}
                </h3>
              </div>
            </div>

            {/* Formula Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center my-3">
              <div className="text-2xl font-mono font-bold text-cyan-300">
                {CONCEPTS[selectedConcept].equation}
              </div>
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                {CONCEPTS[selectedConcept].equationLabel}
              </span>
            </div>

            {/* Scientific Explanation */}
            <div className="my-4 space-y-3 text-xs leading-relaxed text-slate-200">
              <p>{CONCEPTS[selectedConcept].explanation}</p>
            </div>

            {/* Connection to Prototype */}
            <div className="my-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="font-bold text-emerald-400 block mb-1">
                Direct Connection to Arduino Prototype:
              </span>
              <p className="text-slate-300">
                {CONCEPTS[selectedConcept].prototypeConnection}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Key Takeaway: {CONCEPTS[selectedConcept].keyTakeaway}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
