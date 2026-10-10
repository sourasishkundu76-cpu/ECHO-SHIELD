/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { RailwayScene } from './components/3d/RailwayScene';
import { LiveDashboard } from './components/dashboard/LiveDashboard';
import { PhysicsLab } from './components/sections/PhysicsLab';
import { HardwareSection } from './components/sections/HardwareSection';
import { WorkflowSection } from './components/sections/WorkflowSection';
import { RailwayApplicationSection } from './components/sections/RailwayApplicationSection';
import { ScannerSection } from './components/sections/ScannerSection';
import { PhysicsConceptsSection } from './components/sections/PhysicsConceptsSection';
import { PresentationMode } from './components/sections/PresentationMode';
import { ActiveTab } from './types';
import { 
  Radio, 
  Box, 
  Radar, 
  FlaskConical, 
  Table, 
  BookOpen, 
  Workflow, 
  Cpu, 
  Train, 
  Presentation,
  Sparkles,
  Download,
  Usb,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    telemetry,
    isHardwareConnected,
    connectHardware,
    disconnectHardware,
    startDemonstration,
    isDemonstrating,
    trials
  } = useSimulation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tab definitions matching all 10 requested sections
  const TABS: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: '1. Live System', icon: Radio },
    { id: 'simulation', label: '2. 3D Simulation', icon: Box },
    { id: 'scanner', label: '3. Ultrasonic Scanner', icon: Radar },
    { id: 'physics-lab', label: '4. Physics Lab', icon: FlaskConical },
    { id: 'experiment-data', label: '5. Experiment Data', icon: Table },
    { id: 'physics-concepts', label: '6. Physics Concepts', icon: BookOpen },
    { id: 'workflow', label: '7. System Workflow', icon: Workflow },
    { id: 'hardware', label: '8. Hardware Used', icon: Cpu },
    { id: 'applications', label: '9. Railway Application', icon: Train },
    { id: 'presentation', label: '10. About / Presentation', icon: Presentation },
  ];

  // Quick export CSV helper
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
    link.setAttribute('download', `echo_shield_trials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-[#070b16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Radio className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wider text-white">
                  ECHO-SHIELD
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
                  B.Tech Physics
                </span>
              </div>
              <p className="text-[11px] font-mono tracking-wide text-slate-400 hidden sm:block">
                ULTRASONIC RAILWAY TRACK OBSTACLE DETECTION · <span className="text-cyan-300 italic">“Detecting Obstacles Through the Physics of Sound.”</span>
              </p>
            </div>
          </div>

          {/* Quick Header Telemetry & Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Real-time Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  telemetry.status === 'SAFE'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : telemetry.status === 'WARNING'
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-ping'
                }`}
              />
              <span className="font-semibold text-slate-200">
                {telemetry.status === 'SAFE' ? 'TRACK CLEAR' : telemetry.status === 'WARNING' ? 'WARNING' : 'DANGER'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-400 font-bold">{telemetry.measuredDistance.toFixed(1)} cm</span>
            </div>

            {/* Cinematic 3D Demo Tour Button */}
            <button
              onClick={startDemonstration}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
                isDemonstrating
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDemonstrating ? 'Demo Active' : '3D Demo Tour'}</span>
            </button>

            {/* Hardware Web Serial Button */}
            <button
              onClick={isHardwareConnected ? disconnectHardware : connectHardware}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                isHardwareConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
              title="Connect to physical Arduino via Web Serial"
            >
              <Usb className="w-3.5 h-3.5" />
              <span>{isHardwareConnected ? 'Hardware Live' : 'Connect Arduino'}</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
              title="Export Experimental Data as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Primary Navigation Bar */}
        <div className="max-w-7xl mx-auto mt-3 hidden lg:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs text-left transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col gap-6">
        {/* SECTION 1: HOME / LIVE SYSTEM */}
        {activeTab === 'home' && (
          <div className="flex flex-col gap-6">
            {/* Large 3D Railway Environment Scene */}
            <div className="w-full h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80">
              <RailwayScene />
            </div>

            {/* Live Dashboard (Telemetry, Hardware LED Mirror, Controls & Plots) */}
            <LiveDashboard />
          </div>
        )}

        {/* SECTION 2: 3D RAILWAY SIMULATION */}
        {activeTab === 'simulation' && (
          <div className="flex flex-col gap-5">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
                <span>Interactive 3D Simulation Space</span>
                <span>·</span>
                <span>Free Orbital Exploration</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                3D RAILWAY TRACK & ULTRASONIC SENSING ENVIRONMENT
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                Explore the miniature train, rails, sleepers, SG90 servo motor, HC-SR04 ultrasonic sensor, breadboard with LEDs, and the animated ultrasonic wave reflection wavefronts. Drag with left mouse button to orbit, scroll to zoom, and right-click to pan.
              </p>
            </div>

            <div className="w-full h-[620px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80">
              <RailwayScene />
            </div>
          </div>
        )}

        {/* SECTION 3: ULTRASONIC SCANNER */}
        {activeTab === 'scanner' && <ScannerSection />}

        {/* SECTION 4: PHYSICS LAB */}
        {activeTab === 'physics-lab' && <PhysicsLab />}

        {/* SECTION 5: EXPERIMENT DATA */}
        {activeTab === 'experiment-data' && (
          <div className="flex flex-col gap-5">
            <PhysicsLab />
          </div>
        )}

        {/* SECTION 6: PHYSICS CONCEPTS */}
        {activeTab === 'physics-concepts' && <PhysicsConceptsSection />}

        {/* SECTION 7: SYSTEM WORKFLOW */}
        {activeTab === 'workflow' && <WorkflowSection />}

        {/* SECTION 8: HARDWARE */}
        {activeTab === 'hardware' && <HardwareSection />}

        {/* SECTION 9: APPLICATIONS */}
        {activeTab === 'applications' && <RailwayApplicationSection />}

        {/* SECTION 10: ABOUT PROJECT / PRESENTATION */}
        {activeTab === 'presentation' && <PresentationMode />}
      </main>

      {/* Global Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070b16] py-6 px-4 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-bold text-slate-200">ECHO-SHIELD</span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span>First-Year B.Tech Engineering Physics Project Companion</span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="text-cyan-400">“Detecting Obstacles Through the Physics of Sound”</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>Arduino + HC-SR04 + Servo SG90</span>
            <span>·</span>
            <span>40 kHz Ultrasound · v ≈ 343 m/s</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <MainAppContent />
    </SimulationProvider>
  );
}
