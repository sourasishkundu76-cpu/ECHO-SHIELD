import React from 'react';
import { 
  Train, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Wind, 
  Layers, 
  AlertOctagon,
  Gauge,
  ArrowRight
} from 'lucide-react';

export const RailwayApplicationSection: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Mandatory Engineering Project Disclaimer */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-600/50 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <AlertOctagon className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wider mb-1">
              EDUCATIONAL PROTOTYPE SCOPE & REGULATORY DISCLAIMER
            </h3>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              “This application is an educational small-scale prototype. Real railway safety systems require specialized certified sensors, redundancy, fail-safe systems and railway signalling infrastructure.”
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              The railway track, train model, and obstacle serve strictly as the physical demonstration model for understanding ultrasonic wave reflection, Time-of-Flight acoustics, and digital microcontroller interfacing.
            </p>
          </div>
        </div>
      </div>

      {/* Real-World Context & Safety Zone State Machine */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">
          REAL-WORLD RAILWAY TRACK CLEARANCE MONITORING
        </h2>
        <p className="text-xs text-slate-300 max-w-3xl mb-6">
          Every year, railway networks face operational risks from rockfalls on mountain tracks, stalled vehicles at level crossings, fallen trees after storms, and stray animals. Non-contact physical sensors provide automated early warning to prevent catastrophic collisions.
        </p>

        {/* 3 Zone Railway State Machine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Safe Zone */}
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>TRACK CLEAR (SAFE)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                No echo detected within monitored clearance envelope (Distance &gt; 50 cm on model; &gt; 1,000 m on full-scale line).
              </p>
              <div className="p-2.5 rounded bg-slate-900 text-[11px] font-mono text-emerald-300">
                Action: Line clear signal (Green aspect). Train maintains scheduled line speed.
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
              Breadboard Indicator: Green LED HIGH
            </div>
          </div>

          {/* Warning Zone */}
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>OBJECT DETECTED (WARNING)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Obstacle detected within service braking perimeter (20–50 cm on model; 400–1,000 m on full-scale line).
              </p>
              <div className="p-2.5 rounded bg-slate-900 text-[11px] font-mono text-amber-300">
                Action: Caution signal (Yellow aspect). Train initiates controlled regenerative / pneumatic service braking.
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
              Breadboard Indicator: Yellow LED HIGH
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>OBJECT TOO CLOSE (DANGER)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Critical fouling of track gauge (&lt; 20 cm on model; &lt; 400 m on full-scale line). Collision hazard imminent!
              </p>
              <div className="p-2.5 rounded bg-slate-900 text-[11px] font-mono text-rose-300">
                Action: Red Stop aspect + Emergency Brake Application (EBA / Trip-cock interlock).
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
              Breadboard Indicator: Red LED HIGH
            </div>
          </div>
        </div>
      </div>

      {/* Train Kinematics & Braking Distance Physics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-cyan-400" />
              Train Kinematics: The Physics of Braking Distance
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              Unlike road vehicles, steel-wheel on steel-rail contact exhibits a very low friction coefficient (μ ≈ 0.15 to 0.20). Stopping distance depends quadratically on train velocity:
            </p>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono my-3">
              <div className="text-xl font-bold text-cyan-300">
                d_stop = v² / (2 · a_brake)
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Derived from third equation of motion: v_final² = v_initial² − 2as
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/60 flex justify-between">
                <span>Freight Train (80 km/h, 4000 tons):</span>
                <span className="font-mono text-rose-400 font-bold">~800 to 1,200 meters</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/60 flex justify-between">
                <span>Passenger Express (130 km/h):</span>
                <span className="font-mono text-amber-400 font-bold">~600 to 900 meters</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/60 flex justify-between">
                <span>B.Tech Miniature Model (20 cm/s):</span>
                <span className="font-mono text-emerald-400 font-bold">~5 to 10 cm</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4">
            This kinematic reality explains why early detection and multi-stage warning zones are imperative for track clearance.
          </p>
        </div>

        {/* Prototype vs Industrial Reality Comparison */}
        <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-100 mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              Educational Prototype vs. Industrial Systems
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              Why high-frequency ultrasound is ideal for laboratory demonstration but supplemented by LiDAR/Radar in full-scale rail:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-cyan-400 block mb-1">
                  1. Atmospheric Acoustic Attenuation
                </span>
                <span className="text-slate-300">
                  40 kHz sound waves experience severe attenuation in air (~1.2 dB/meter). Maximum reliable range is ~4 meters, making it ideal for tabletop miniature tracks or tunnel portals, but requiring electromagnetic radar for kilometer-scale rail.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-amber-400 block mb-1">
                  2. Weather & Temperature Sensitivity
                </span>
                <span className="text-slate-300">
                  Speed of sound shifts with temperature (331 m/s at 0°C to 355 m/s at 40°C), requiring continuous thermal compensation algorithms in outdoor deployments.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-semibold text-emerald-400 block mb-1">
                  3. Fail-Safe Principle (Vital Signalling)
                </span>
                <span className="text-slate-300">
                  Industrial railway signalling utilizes "fail-safe" design: any broken wire, power cut, or sensor failure must cause the system to drop into the restrictive (STOP/RED) state by default.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
