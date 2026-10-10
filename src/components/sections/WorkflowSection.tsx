import React, { useState } from 'react';
import { 
  Cpu, 
  Radio, 
  Waves, 
  ArrowRight, 
  MoveRight, 
  ShieldAlert, 
  Lightbulb, 
  Clock, 
  Compass, 
  Calculator, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const WORKFLOW_STEPS = [
    {
      id: 'arduino-trigger',
      title: '1. Arduino Trigger Initiation',
      subtitle: 'Digital Pin 10 sends 10 μs HIGH pulse',
      icon: Cpu,
      color: 'text-cyan-400',
      timing: 'Duration: 10 microseconds',
      hardware: 'ATmega328P Microcontroller',
      explanation:
        'The microcontroller firmware pulls the HC-SR04 Trigger pin LOW for 2 μs, then HIGH for 10 μs, then LOW again. This clean TTL square pulse commands the ultrasonic module on-board controller to initialize an ultrasonic ping sequence.',
      codeSnippet: `digitalWrite(PIN_TRIG, LOW);
delayMicroseconds(2);
digitalWrite(PIN_TRIG, HIGH);
delayMicroseconds(10);
digitalWrite(PIN_TRIG, LOW);`,
      physicsNote:
        'The 10 μs pulse provides sufficient energy to charge the transmitter circuit without causing prolonged ringing interference.'
    },
    {
      id: 'hcsr04-burst',
      title: '2. 40 kHz Sonic Burst Emission',
      subtitle: 'Transducer T converts voltage to mechanical vibration',
      icon: Radio,
      color: 'text-sky-400',
      timing: 'Frequency: 40,000 Hz (8 acoustic cycles)',
      hardware: 'HC-SR04 Transmitter Transducer (T)',
      explanation:
        'Upon receiving the trigger pulse, the on-board ASIC in the HC-SR04 drives the piezoelectric crystal at its mechanical resonant frequency of 40 kHz. The crystal expands and contracts violently, generating an 8-cycle packet of ultrasonic sound.',
      codeSnippet: `// Handled internally by HC-SR04 hardware ASIC:
// Generates 8-cycle square burst at 40 kHz
// Total emission duration ≈ 200 microseconds`,
      physicsNote:
        'Resonant excitation provides maximum acoustic pressure amplitude (SPL > 100 dB at 10 cm).'
    },
    {
      id: 'wave-propagation',
      title: '3. Acoustic Wave Propagation',
      subtitle: 'Longitudinal pressure wave travels through air',
      icon: Waves,
      color: 'text-blue-400',
      timing: 'v ≈ 343 m/s at 20°C',
      hardware: 'Atmospheric Medium (Air)',
      explanation:
        'The acoustic wave propagates forward through air as alternating compressions and rarefactions. The wave travels with a finite physical speed determined by air temperature and density: v = √(γ · R · T / M).',
      codeSnippet: `// Wave speed formula:
// v(T) = 331.3 * sqrt(1 + T / 273.15) m/s`,
      physicsNote:
        'Sound does not transport matter; it transfers momentum and acoustic energy via molecular collisions in air.'
    },
    {
      id: 'obstacle-boundary',
      title: '4. Obstacle Boundary Impact',
      subtitle: 'Incident sound strikes track obstacle surface',
      icon: MoveRight,
      color: 'text-amber-400',
      timing: 'Instantaneous surface interaction',
      hardware: 'Railway Obstacle (Miniature Model)',
      explanation:
        'When the 40 kHz ultrasonic wavefront hits an obstacle on the railway track, it encounters an interface between air and the obstacle material (wood, metal, plastic). Due to the impedance mismatch between air (Z₁ ≈ 415 Rayls) and the dense solid obstacle (Z₂ > 10⁶ Rayls), most acoustic energy reflects.',
      codeSnippet: `// Acoustic impedance mismatch:
// Reflection coefficient: R = ((Z2 - Z1) / (Z2 + Z1))^2 ≈ 0.98`,
      physicsNote:
        'Conservation of energy: Incident Energy = Reflected Energy + Absorbed Energy + Transmitted Energy.'
    },
    {
      id: 'specular-reflection',
      title: '5. Specular Reflection & Echo Formation',
      subtitle: 'Angle of incidence equals angle of reflection (θᵢ = θᵣ)',
      icon: Waves,
      color: 'text-amber-500',
      timing: 'Wavefront reversal towards sensor',
      hardware: 'Obstacle Surface Interface',
      explanation:
        'Because the obstacle surface is perpendicular to the track line of sight, the incident wave bounces back toward the sensor as an acoustic echo wavefront.',
      codeSnippet: `// Law of Reflection:
// theta_reflected = theta_incident
// Returns directly towards Receiver R`,
      physicsNote:
        'Surfaces tilted greater than 15° scatter ultrasound away from the receiver aperture, which can cause target loss.'
    },
    {
      id: 'echo-reception',
      title: '6. Echo Reception at Transducer R',
      subtitle: 'Piezoelectric sensor converts sound pressure to voltage',
      icon: Radio,
      color: 'text-emerald-400',
      timing: 'Trigger to Echo arrival time',
      hardware: 'HC-SR04 Receiver Transducer (R)',
      explanation:
        'The returning mechanical compression wave strikes the diaphragm of receiver barrel R. The piezoelectric crystal vibrates, generating a microvolt AC signal that is filtered and amplified by the HC-SR04 on-board operational amplifier (LM324).',
      codeSnippet: `// Receiver amplifier detects incoming 40 kHz burst
// Pulls Echo pin HIGH upon detection`,
      physicsNote:
        'Band-pass filtering in the module rejects ambient audible acoustic noise.'
    },
    {
      id: 'time-of-flight',
      title: '7. Time of Flight (ToF) Timing',
      subtitle: 'Arduino pulseIn() clocks round-trip duration in μs',
      icon: Clock,
      color: 'text-indigo-400',
      timing: 'Measured in microseconds (μs)',
      hardware: 'Arduino Timer & Interrupt Register',
      explanation:
        'The HC-SR04 Echo pin stays HIGH for the exact duration between ultrasonic burst transmission and echo reception. The Arduino function pulseIn() waits for the pin to go HIGH, starts a hardware counter, and stops when the pin drops LOW.',
      codeSnippet: `durationUs = pulseIn(PIN_ECHO, HIGH, 30000);
// Returns duration in microseconds`,
      physicsNote:
        'Round-trip travel time: t = (2 × distance) / v.'
    },
    {
      id: 'distance-calculation',
      title: '8. Distance Calculation (d = vt / 2)',
      subtitle: 'Dividing round-trip distance by 2 for target distance',
      icon: Calculator,
      color: 'text-purple-400',
      timing: 'Computation: ~2 microseconds',
      hardware: 'Arduino ALU (Arithmetic Logic Unit)',
      explanation:
        'The Arduino calculates the physical one-way obstacle distance: distance (cm) = (timeOfFlight × speedOfSound) / 2 = durationUs / 58.2.',
      codeSnippet: `float distanceCm = (durationUs * 0.0343) / 2.0;
// Or shortcut:
float distanceCm = durationUs / 58.2;`,
      physicsNote:
        'The division by 2 is essential because sound travels out to the obstacle and back again.'
    },
    {
      id: 'servo-scanning',
      title: '9. Servo Angular Spatial Indexing',
      subtitle: 'SG90 rotates sensor to inspect adjacent track zone',
      icon: Compass,
      color: 'text-sky-400',
      timing: 'Incremental stepping: 0° to 90°',
      hardware: 'TowerPro SG90 Micro Servo',
      explanation:
        'The Arduino writes a new PWM duty cycle to Pin 9, rotating the servo by 5° to survey the next sector along the railway track clearance corridor.',
      codeSnippet: `scannerServo.write(currentAngle);
currentAngle += sweepStep;`,
      physicsNote:
        'Converts a 1D rangefinder into a 2D spatial clearance scanner.'
    },
    {
      id: 'safety-zone',
      title: '10. Safety Zone Classification',
      subtitle: 'Evaluates distance against threshold boundaries',
      icon: ShieldAlert,
      color: 'text-amber-400',
      timing: 'Immediate algorithmic branch',
      hardware: 'Arduino Logic Firmware',
      explanation:
        'The calculated distance is evaluated: If d < 20 cm → DANGER; If 20 cm ≤ d ≤ 50 cm → WARNING; If d > 50 cm → SAFE TRACK CLEAR.',
      codeSnippet: `if (distance < 20.0) {
  status = DANGER;
} else if (distance <= 50.0) {
  status = WARNING;
} else {
  status = SAFE;
}`,
      physicsNote:
        'Safety thresholds in real systems are determined by train braking distance: d_stop = v_train² / (2 · a_brake).'
    },
    {
      id: 'led-indication',
      title: '11. Breadboard LED Indication',
      subtitle: 'Physical optical alarm on breadboard',
      icon: Lightbulb,
      color: 'text-rose-400',
      timing: 'Immediate optical output',
      hardware: 'LEDs (Pins 11, 12, 13) + Resistors',
      explanation:
        'The Arduino sets the corresponding digital pin HIGH. As shown in the reference video: Green LED illuminates when track is clear; Red LED illuminates brightly when an obstacle is detected in the danger zone.',
      codeSnippet: `digitalWrite(LED_RED, HIGH);
digitalWrite(LED_YELLOW, LOW);
digitalWrite(LED_GREEN, LOW);`,
      physicsNote:
        'Electroluminescence: Current flowing through the semiconductor PN junction emits photons proportional to current.'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
          <span>End-to-End Execution Sequence</span>
          <span>·</span>
          <span>11 Clickable Steps</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          COMPLETE SYSTEM & PHYSICS WORKFLOW
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl">
          Follow every microsecond of the physical detection cycle — from initial electrical trigger to sound wave propagation, boundary reflection, echo reception, math calculation, and physical LED illumination.
        </p>
      </div>

      {/* Interactive 11-Step Pipeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Step Navigation Sidebar (Left) */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          {WORKFLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  activeStep === idx
                    ? 'bg-slate-800 border-cyan-500 shadow-lg text-white'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                    activeStep === idx ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-xs block">{step.title}</span>
                    <span className="text-[10px] text-slate-400 block">{step.subtitle}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 ${activeStep === idx ? 'text-cyan-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Active Step Deep-Dive Card (Right) */}
        <div className="lg:col-span-7 rounded-xl p-6 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  {React.createElement(WORKFLOW_STEPS[activeStep].icon, {
                    className: `w-6 h-6 ${WORKFLOW_STEPS[activeStep].color}`
                  })}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {WORKFLOW_STEPS[activeStep].title}
                  </h3>
                  <span className="text-xs font-mono text-cyan-400">
                    {WORKFLOW_STEPS[activeStep].timing}
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {WORKFLOW_STEPS[activeStep].hardware}
              </span>
            </div>

            {/* Explanation */}
            <div className="my-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Mechanism Description:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {WORKFLOW_STEPS[activeStep].explanation}
              </p>
            </div>

            {/* Physics Principle Callout */}
            <div className="my-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block mb-1">
                Physics Law at This Stage:
              </span>
              <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
                {WORKFLOW_STEPS[activeStep].physicsNote}
              </p>
            </div>

            {/* Code Snippet */}
            <div className="mt-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Arduino Microcontroller Execution:
              </span>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                {WORKFLOW_STEPS[activeStep].codeSnippet}
              </pre>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              Previous Stage
            </button>
            <span className="text-[11px] font-mono text-slate-500">
              Stage {activeStep + 1} of {WORKFLOW_STEPS.length}
            </span>
            <button
              disabled={activeStep === WORKFLOW_STEPS.length - 1}
              onClick={() => setActiveStep(prev => Math.min(WORKFLOW_STEPS.length - 1, prev + 1))}
              className="px-3 py-1.5 rounded bg-cyan-600 text-white font-medium hover:bg-cyan-500 disabled:opacity-30 disabled:pointer-events-none"
            >
              Next Stage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
