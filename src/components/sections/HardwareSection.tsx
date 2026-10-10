import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Cpu, 
  Radio, 
  Compass, 
  Lightbulb, 
  Grid, 
  Cable, 
  Copy, 
  Check, 
  Usb, 
  ArrowRight, 
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const HardwareSection: React.FC = () => {
  const {
    isHardwareConnected,
    hardwarePortName,
    connectHardware,
    disconnectHardware,
    hardwareError
  } = useSimulation();

  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<number>(0);

  const HARDWARE_COMPONENTS = [
    {
      id: 'arduino',
      name: 'Arduino Microcontroller Board',
      icon: Cpu,
      color: 'text-cyan-400',
      model: 'ATmega328P Architecture (Uno / Nano)',
      role: 'Master digital processor & timing controller',
      pinConnections: [
        'Pin 9: PWM Signal Output to SG90 Servo',
        'Pin 10: Trigger Output to HC-SR04 (10 μs pulse)',
        'Pin 2 (or 3): Echo Input from HC-SR04 (pulseIn())',
        'Pin 13: Digital Output to Green LED (Safe)',
        'Pin 12: Digital Output to Yellow LED (Warning)',
        'Pin 11: Digital Output to Red LED (Danger)',
        '5V / GND: Regulated DC power bus'
      ],
      description:
        'Controls the entire sensory experiment cycle. Generates the 10-microsecond trigger pulse, executes precise pulseIn() microsecond timing of the returning echo, evaluates the mathematical formula d = (v × t) / 2, commands the servo motor sweep, and illuminates the corresponding breadboard LEDs based on safety zone thresholds.'
    },
    {
      id: 'hcsr04',
      name: 'HC-SR04 Ultrasonic Sensor Module',
      icon: Radio,
      color: 'text-sky-400',
      model: 'Dual Transducer Module (Transmitter + Receiver)',
      role: 'Acoustic wave emission & echo detection',
      pinConnections: [
        'VCC: Connected to 5V power rail',
        'Trig: Connected to Arduino Pin 10',
        'Echo: Connected to Arduino Pin 2',
        'GND: Connected to common ground rail'
      ],
      description:
        'Houses two 40 kHz piezoelectric transducers. Transducer "T" transforms electrical oscillations into ultrasonic longitudinal pressure waves in air. Transducer "R" detects the returning reflected echo and outputs a high-level digital pulse on the Echo pin whose duration is directly proportional to the round-trip Time of Flight.'
    },
    {
      id: 'servo',
      name: 'SG90 Micro Servo Motor',
      icon: Compass,
      color: 'text-indigo-400',
      model: 'TowerPro SG90 9g Micro Servo',
      role: 'Rotational platform for track scanning (0° to 90°)',
      pinConnections: [
        'Brown Wire: Ground (GND)',
        'Red Wire: 5V Power',
        'Orange/Yellow Wire: PWM Control Signal (Pin 9)'
      ],
      description:
        'Mechanically sweeps the ultrasonic sensor across the miniature railway track environment. By rotating the sensor from 0° (left clearance) to 90° (right clearance), it transforms a point distance sensor into an active spatial obstacle scanner.'
    },
    {
      id: 'leds',
      name: 'Status Indicator LEDs',
      icon: Lightbulb,
      color: 'text-emerald-400',
      model: '5mm Diffused LEDs (Green, Yellow, Red) + 220Ω Resistors',
      role: 'Immediate optical safety zone feedback',
      pinConnections: [
        'Green LED Anode: Arduino Pin 13 through 220Ω resistor',
        'Yellow LED Anode: Arduino Pin 12 through 220Ω resistor',
        'Red LED Anode: Arduino Pin 11 through 220Ω resistor',
        'All Cathodes: Tied to breadboard Ground rail'
      ],
      description:
        'Provides real-time visual safety classification on the breadboard. As demonstrated in the project video, when an obstacle approaches within the danger threshold, the Red LED fires brightly, while clear tracks maintain the Green LED.'
    },
    {
      id: 'breadboard',
      name: 'Half-Size Solderless Breadboard',
      icon: Grid,
      color: 'text-amber-400',
      model: '400 Tie-Point Solderless Breadboard',
      role: 'Modular prototype circuit distribution',
      pinConnections: [
        'Top/Bottom Rails: Common 5V DC and GND power distribution',
        'Center Terminal Strips: Interconnects LED leads, current-limiting resistors, and jumper routing'
      ],
      description:
        'Serves as the physical prototyping backbone. Enables clean, solder-free wiring between the Arduino controller, LEDs, resistors, servo power lines, and sensor jumper cables.'
    },
    {
      id: 'wires',
      name: 'DuPont Jumper Wires',
      icon: Cable,
      color: 'text-rose-400',
      model: 'Male-to-Male & Male-to-Female Ribbon Jumpers',
      role: 'Electrical signal and power interconnects',
      pinConnections: [
        'Male-to-Female: Arduino/Breadboard to HC-SR04 header pins',
        'Male-to-Male: Arduino headers to breadboard terminal rows',
        'Servo 3-pin Header: Jumped to power and PWM pins'
      ],
      description:
        'Flexible 28 AWG insulated conductors carrying 5V DC power, ground references, 10 μs TTL trigger signals, microsecond echo timing logic, and servo PWM modulation.'
    }
  ];

  const ARDUINO_SOURCE_CODE = `/*
 * ECHO-SHIELD: Ultrasonic Railway Track Obstacle Detection
 * First-Year B.Tech Physics Project
 *
 * HARDWARE SETUP:
 * - Arduino Uno / Nano (ATmega328P)
 * - HC-SR04 Ultrasonic Sensor (Trig: Pin 10, Echo: Pin 2)
 * - SG90 Micro Servo Motor (Signal: Pin 9)
 * - Status LEDs: Green (Pin 13), Yellow (Pin 12), Red (Pin 11)
 * - Half-Size Breadboard with 220 Ohm current-limiting resistors
 * - DuPont Jumper Wires
 */

#include <Servo.h>

// Pin Definitions
const int PIN_SERVO  = 9;
const int PIN_TRIG   = 10;
const int PIN_ECHO   = 2;
const int LED_GREEN  = 13; // Safe Zone (> 50 cm)
const int LED_YELLOW = 12; // Warning Zone (20 - 50 cm)
const int LED_RED    = 11; // Danger Zone (< 20 cm)

// Physics Constants
const float SPEED_OF_SOUND = 0.0343; // cm per microsecond at 20°C (343 m/s)

// Configurable Safety Zone Thresholds (in cm)
const float THRESHOLD_DANGER  = 20.0;
const float THRESHOLD_WARNING = 50.0;

Servo scannerServo;
int currentAngle = 0;
int sweepStep = 5;

void setup() {
  Serial.begin(9600);
  
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);

  scannerServo.attach(PIN_SERVO);
  scannerServo.write(45); // Center bore sight
  delay(500);
}

// Function to measure Time of Flight and compute Distance
float measureDistance(unsigned long &durationUs) {
  // Clear trigger pin
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  
  // Send 10 microsecond trigger pulse
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  
  // Measure echo return duration in microseconds
  durationUs = pulseIn(PIN_ECHO, HIGH, 30000); // 30ms timeout (~5m)
  
  if (durationUs == 0) {
    return 400.0; // Out of range or no echo detected
  }
  
  // Physics formula: d = (v * t) / 2
  float distanceCm = (durationUs * SPEED_OF_SOUND) / 2.0;
  return distanceCm;
}

void loop() {
  // 1. Move servo across 0° to 90° scanning arc
  scannerServo.write(currentAngle);
  delay(60); // Allow servo to mechanically settle
  
  // 2. Ultrasonic Time-of-Flight Measurement
  unsigned long timeOfFlight = 0;
  float distance = measureDistance(timeOfFlight);
  
  // 3. Update Breadboard LED Safety Status
  if (distance < THRESHOLD_DANGER) {
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_GREEN, LOW);
  } else if (distance <= THRESHOLD_WARNING) {
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, HIGH);
    digitalWrite(LED_GREEN, LOW);
  } else {
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_GREEN, HIGH);
  }
  
  // 4. Output Telemetry via Serial (Compatible with ECHO-SHIELD App)
  Serial.print("DIST:");
  Serial.print(distance, 1);
  Serial.print(",ANGLE:");
  Serial.print(currentAngle);
  Serial.print(",TOF:");
  Serial.println(timeOfFlight);
  
  // 5. Increment Angle for continuous sweep
  currentAngle += sweepStep;
  if (currentAngle >= 90 || currentAngle <= 0) {
    sweepStep = -sweepStep; // Reverse direction
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ARDUINO_SOURCE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Hardware Scope Guarantee Banner */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Strict Hardware Compliance</span>
              <span>·</span>
              <span>Physical Arduino Reference Kit</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              HARDWARE SPECIFICATIONS & CIRCUIT ARCHITECTURE
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Strictly confined to the 6 components demonstrated in the student project video. No external displays, buzzers, GPS, or secondary sensors.
            </p>
          </div>

          {/* Web Serial Live Connection Status */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isHardwareConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="font-bold text-slate-200">
                {isHardwareConnected ? 'LIVE HARDWARE MODE' : 'SIMULATION MODE'}
              </span>
            </div>

            {isHardwareConnected ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400">{hardwarePortName}</span>
                <button
                  onClick={disconnectHardware}
                  className="px-2 py-0.5 rounded bg-rose-900/40 text-rose-300 hover:bg-rose-900 text-[10px]"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectHardware}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-[11px] transition-all"
              >
                <Usb className="w-3.5 h-3.5" />
                <span>Connect Arduino (USB)</span>
              </button>
            )}

            {hardwareError && (
              <span className="text-[10px] text-rose-400 max-w-xs text-right mt-1">{hardwareError}</span>
            )}
          </div>
        </div>
      </div>

      {/* Hardware Architecture Diagram */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
        <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
          <span>HARDWARE-TO-APPLICATION ARCHITECTURE PIPELINE</span>
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono">
          <div className="p-2.5 rounded bg-slate-900 text-center border border-slate-800 min-w-[100px]">
            <span className="text-slate-400 text-[10px] block">Stage 1</span>
            <span className="text-cyan-400 font-bold">Physical Hardware</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="p-2.5 rounded bg-slate-900 text-center border border-slate-800 min-w-[100px]">
            <span className="text-slate-400 text-[10px] block">Stage 2</span>
            <span className="text-sky-400 font-bold">HC-SR04 Pulse</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="p-2.5 rounded bg-slate-900 text-center border border-slate-800 min-w-[100px]">
            <span className="text-slate-400 text-[10px] block">Stage 3</span>
            <span className="text-amber-400 font-bold">Echo Time (μs)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="p-2.5 rounded bg-slate-900 text-center border border-slate-800 min-w-[100px]">
            <span className="text-slate-400 text-[10px] block">Stage 4</span>
            <span className="text-indigo-400 font-bold">Arduino (ATmega)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="p-2.5 rounded bg-slate-900 text-center border border-slate-800 min-w-[100px]">
            <span className="text-slate-400 text-[10px] block">Stage 5</span>
            <span className="text-purple-400 font-bold">Distance d = vt/2</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="p-2.5 rounded bg-slate-900 text-center border border-slate-800 min-w-[100px]">
            <span className="text-slate-400 text-[10px] block">Stage 6</span>
            <span className="text-emerald-400 font-bold">LED Status</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="p-2.5 rounded bg-slate-900 text-center border border-slate-800 min-w-[100px]">
            <span className="text-slate-400 text-[10px] block">Stage 7</span>
            <span className="text-cyan-300 font-bold">Digital 3D App</span>
          </div>
        </div>
      </div>

      {/* The 6 Demonstrated Components Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Component Selector List (Left) */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          {HARDWARE_COMPONENTS.map((comp, idx) => {
            const Icon = comp.icon;
            return (
              <button
                key={comp.id}
                onClick={() => setSelectedComponent(idx)}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  selectedComponent === idx
                    ? 'bg-slate-800/90 border-cyan-500 shadow-md text-white'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                  <Icon className={`w-5 h-5 ${comp.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{comp.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{comp.model}</span>
                  <span className="text-[10px] font-mono text-cyan-400 block mt-1">{comp.role}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Component Deep Dive (Right) */}
        <div className="lg:col-span-7 rounded-xl p-6 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                {React.createElement(HARDWARE_COMPONENTS[selectedComponent].icon, {
                  className: `w-6 h-6 ${HARDWARE_COMPONENTS[selectedComponent].color}`
                })}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {HARDWARE_COMPONENTS[selectedComponent].name}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {HARDWARE_COMPONENTS[selectedComponent].model}
                </span>
              </div>
            </div>

            <div className="my-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
                Role in Experiment
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {HARDWARE_COMPONENTS[selectedComponent].description}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2">
                Pin Connections & Circuit Wiring:
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                {HARDWARE_COMPONENTS[selectedComponent].pinConnections.map((pin, i) => (
                  <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800/60 text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                    <span>{pin}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Compliant with the physical wiring demonstrated in the reference project video.
          </div>
        </div>
      </div>

      {/* Arduino C++ Firmware Sketch Viewer */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-md overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs font-mono text-slate-200">
              EchoShield_Arduino.ino (Ready-to-Flash C++ Code)
            </span>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-all"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Sketch</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 overflow-x-auto max-h-[380px] bg-slate-950/90 font-mono text-xs text-slate-300 leading-relaxed">
          <pre>{ARDUINO_SOURCE_CODE}</pre>
        </div>
      </div>
    </div>
  );
};
