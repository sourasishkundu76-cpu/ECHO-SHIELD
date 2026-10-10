import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useSimulation } from '../../context/SimulationContext';
import { 
  Camera, 
  Eye, 
  RotateCcw, 
  Maximize2, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Layers,
  Sparkles
} from 'lucide-react';
import { MATERIALS_DATA } from '../../utils/physics';

export const RailwayScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    telemetry,
    servoAngle,
    isObstaclePresent,
    obstacleDistance,
    obstacleAngle,
    obstacleMaterial,
    isPlaying,
    zoneThresholds,
    isDemonstrating,
    demonstrationDescription,
    activeTab
  } = useSimulation();

  const [cameraPreset, setCameraPreset] = useState<'overview' | 'sensor' | 'driver' | 'top' | 'bench'>('overview');
  const [showWaveRays, setShowWaveRays] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);

  // References to 3D objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  // Meshes for animated updates
  const servoGroupRef = useRef<THREE.Group | null>(null);
  const obstacleMeshRef = useRef<THREE.Mesh | null>(null);
  const obstacleGroupRef = useRef<THREE.Group | null>(null);
  const transmittedWavesRef = useRef<THREE.Group | null>(null);
  const reflectedWavesRef = useRef<THREE.Group | null>(null);
  const greenLedRef = useRef<THREE.Mesh | null>(null);
  const yellowLedRef = useRef<THREE.Mesh | null>(null);
  const redLedRef = useRef<THREE.Mesh | null>(null);
  const greenLightRef = useRef<THREE.PointLight | null>(null);
  const yellowLightRef = useRef<THREE.PointLight | null>(null);
  const redLightRef = useRef<THREE.PointLight | null>(null);
  const dangerAuraRef = useRef<THREE.Mesh | null>(null);
  const trainGroupRef = useRef<THREE.Group | null>(null);
  const radarArcMeshRef = useRef<THREE.Mesh | null>(null);

  // Wave animation time tracking
  const waveTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913); // Deep midnight laboratory
    scene.fog = new THREE.FogExp2(0x060913, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 10, 16);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
    controls.minDistance = 3;
    controls.maxDistance = 45;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.2);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    const labBlueLight = new THREE.PointLight(0x0284c7, 1.5, 30);
    labBlueLight.position.set(-8, 6, -5);
    scene.add(labBlueLight);

    // 6. Floor & Grid (Engineering Lab floor with subtle grid)
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090e1a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(50, 50, 0x1e293b, 0x0f172a);
    grid.position.y = 0.01;
    scene.add(grid);

    // 7. Track Foundation & Ballast
    // Track runs along Z axis from z = -15 to z = +15
    const ballastGeo = new THREE.BoxGeometry(4.2, 0.25, 34);
    const ballastMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1
    });
    const ballast = new THREE.Mesh(ballastGeo, ballastMat);
    ballast.position.set(0, 0.12, 0);
    ballast.receiveShadow = true;
    scene.add(ballast);

    // Sleepers (Wooden railway ties)
    const sleeperGeo = new THREE.BoxGeometry(3.6, 0.18, 0.45);
    const sleeperMat = new THREE.MeshStandardMaterial({
      color: 0x47382d, // Wood brown
      roughness: 0.85
    });
    for (let z = -16; z <= 16; z += 1.0) {
      const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
      sleeper.position.set(0, 0.32, z);
      sleeper.receiveShadow = true;
      scene.add(sleeper);
    }

    // Steel Rails (Two parallel rails)
    const railGeo = new THREE.BoxGeometry(0.12, 0.25, 34);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.92,
      roughness: 0.18
    });
    
    // Left rail (x = -1.1)
    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-1.1, 0.5, 0);
    leftRail.castShadow = true;
    scene.add(leftRail);

    // Right rail (x = +1.1)
    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(1.1, 0.5, 0);
    rightRail.castShadow = true;
    scene.add(rightRail);

    // 8. Miniature Train Model (Locomotive on tracks at z = -9)
    const trainGroup = new THREE.Group();
    trainGroup.position.set(0, 0.65, -9);
    trainGroupRef.current = trainGroup;

    // Train Body (Cab + Boiler)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.5, roughness: 0.4 });
    const cabGeo = new THREE.BoxGeometry(2.0, 1.8, 2.2);
    const cab = new THREE.Mesh(cabGeo, bodyMat);
    cab.position.set(0, 1.1, -1.2);
    cab.castShadow = true;
    trainGroup.add(cab);

    // Windows
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.1, metalness: 0.9 });
    const cabWindowFront = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.05), windowMat);
    cabWindowFront.position.set(0, 1.3, -0.08);
    trainGroup.add(cabWindowFront);

    // Boiler cylinder
    const boilerGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.2, 24);
    const boiler = new THREE.Mesh(boilerGeo, bodyMat);
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(0, 0.9, 1.2);
    boiler.castShadow = true;
    trainGroup.add(boiler);

    // Chimney / Smokestack
    const chimneyGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.8, 16);
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(0, 1.9, 2.2);
    trainGroup.add(chimney);

    // Cowcatcher / Front plow
    const plowGeo = new THREE.ConeGeometry(1.0, 0.8, 4);
    const plowMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.6 });
    const plow = new THREE.Mesh(plowGeo, plowMat);
    plow.rotation.x = Math.PI / 2;
    plow.rotation.z = Math.PI / 4;
    plow.position.set(0, 0.3, 2.8);
    trainGroup.add(plow);

    // Train Headlight
    const headlightMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.25, 16),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.2 })
    );
    headlightMesh.rotation.x = Math.PI / 2;
    headlightMesh.position.set(0, 1.1, 2.85);
    trainGroup.add(headlightMesh);

    const trainSpotLight = new THREE.SpotLight(0xfef08a, 2.5, 20, Math.PI / 6, 0.4);
    trainSpotLight.position.set(0, 1.1, 2.9);
    trainSpotLight.target.position.set(0, 0.5, 12);
    trainGroup.add(trainSpotLight);
    trainGroup.add(trainSpotLight.target);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.18, 20);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.25 });
    [-1.0, 0.2, 1.4, 2.4].forEach((zPos) => {
      const wL = new THREE.Mesh(wheelGeo, wheelMat);
      wL.rotation.z = Math.PI / 2;
      wL.position.set(-1.1, 0.38, zPos);
      trainGroup.add(wL);

      const wR = new THREE.Mesh(wheelGeo, wheelMat);
      wR.rotation.z = Math.PI / 2;
      wR.position.set(1.1, 0.38, zPos);
      trainGroup.add(wR);
    });

    scene.add(trainGroup);

    // 9. Hardware Bench / Test Rig Pedestal next to track
    // Positioned beside the railway track at x = 3.5, z = -3.5
    const benchGeo = new THREE.BoxGeometry(4.0, 1.0, 3.2);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.3
    });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(3.8, 0.5, -2.5);
    bench.receiveShadow = true;
    bench.castShadow = true;
    scene.add(bench);

    // Arduino Board Model on Bench
    const arduinoGroup = new THREE.Group();
    arduinoGroup.position.set(4.4, 1.05, -3.2);
    const pcbGeo = new THREE.BoxGeometry(1.6, 0.08, 1.1);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }); // Arduino Teal-Blue
    const arduinoPcb = new THREE.Mesh(pcbGeo, pcbMat);
    arduinoPcb.castShadow = true;
    arduinoGroup.add(arduinoPcb);

    // ATmega328P Chip
    const mcuGeo = new THREE.BoxGeometry(0.7, 0.06, 0.25);
    const mcuMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
    const mcu = new THREE.Mesh(mcuGeo, mcuMat);
    mcu.position.set(0.1, 0.06, 0);
    arduinoGroup.add(mcu);

    // USB Port Silver Can
    const usbGeo = new THREE.BoxGeometry(0.35, 0.22, 0.3);
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(-0.7, 0.12, 0.25);
    arduinoGroup.add(usb);
    scene.add(arduinoGroup);

    // Half-Size Breadboard Model on Bench
    const breadboardGroup = new THREE.Group();
    breadboardGroup.position.set(3.2, 1.05, -1.8);
    const bbGeo = new THREE.BoxGeometry(2.2, 0.12, 1.5);
    const bbMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }); // White breadboard
    const bb = new THREE.Mesh(bbGeo, bbMat);
    bb.castShadow = true;
    breadboardGroup.add(bb);

    // Breadboard Power Bus Stripes (Red + Blue)
    const redBus = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.01, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    redBus.position.set(0, 0.07, -0.65);
    breadboardGroup.add(redBus);

    const blueBus = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.01, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
    );
    blueBus.position.set(0, 0.07, -0.58);
    breadboardGroup.add(blueBus);

    // Physical LEDs on Breadboard (Green, Yellow, Red) - EXACTLY MATCHING REFERENCE VIDEO!
    const ledDomeGeo = new THREE.SphereGeometry(0.1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    
    // Green LED (Safe)
    const greenMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.2,
      roughness: 0.2
    });
    const greenLed = new THREE.Mesh(ledDomeGeo, greenMat);
    greenLed.position.set(-0.6, 0.08, 0);
    breadboardGroup.add(greenLed);
    greenLedRef.current = greenLed;

    const greenLight = new THREE.PointLight(0x22c55e, 0, 3);
    greenLight.position.set(-0.6, 0.35, 0);
    breadboardGroup.add(greenLight);
    greenLightRef.current = greenLight;

    // Yellow LED (Warning)
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xeab308,
      emissiveIntensity: 0.2,
      roughness: 0.2
    });
    const yellowLed = new THREE.Mesh(ledDomeGeo, yellowMat);
    yellowLed.position.set(0, 0.08, 0);
    breadboardGroup.add(yellowLed);
    yellowLedRef.current = yellowLed;

    const yellowLight = new THREE.PointLight(0xeab308, 0, 3);
    yellowLight.position.set(0, 0.35, 0);
    breadboardGroup.add(yellowLight);
    yellowLightRef.current = yellowLight;

    // Red LED (Danger / Obstacle Detected)
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.2,
      roughness: 0.2
    });
    const redLed = new THREE.Mesh(ledDomeGeo, redMat);
    redLed.position.set(0.6, 0.08, 0);
    breadboardGroup.add(redLed);
    redLedRef.current = redLed;

    const redLight = new THREE.PointLight(0xef4444, 0, 4);
    redLight.position.set(0.6, 0.35, 0);
    breadboardGroup.add(redLight);
    redLightRef.current = redLight;

    // Jumper Wires connecting Arduino, Breadboard & Servo
    const wireCurves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(3.8, 1.15, -3.0),
        new THREE.Vector3(3.6, 1.35, -2.5),
        new THREE.Vector3(3.2, 1.15, -1.8)
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(4.0, 1.15, -3.0),
        new THREE.Vector3(3.7, 1.4, -2.4),
        new THREE.Vector3(2.6, 1.15, -1.8)
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(3.2, 1.15, -1.2),
        new THREE.Vector3(2.4, 1.4, -0.6),
        new THREE.Vector3(1.9, 1.25, 0.0)
      ])
    ];
    const wireColors = [0xef4444, 0x10b981, 0xf59e0b];
    wireCurves.forEach((curve, idx) => {
      const wireGeo = new THREE.TubeGeometry(curve, 20, 0.025, 8, false);
      const wireMesh = new THREE.Mesh(wireGeo, new THREE.MeshStandardMaterial({ color: wireColors[idx], roughness: 0.4 }));
      scene.add(wireMesh);
    });

    scene.add(breadboardGroup);

    // 10. SERVO MOTOR & HC-SR04 SENSOR MOUNT
    // Mounted along the track shoulder at (x = 1.9, z = -0.5) overlooking the track ahead!
    const trackScannerPost = new THREE.Group();
    trackScannerPost.position.set(1.9, 0.5, -0.5);

    // Base Post Stand
    const postGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 16);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(0, 0.4, 0);
    trackScannerPost.add(post);

    // SG90 Micro Servo Body (Blue Translucent Plastic)
    const servoBodyGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    const servoBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // TowerPro Blue
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.92
    });
    const servoBody = new THREE.Mesh(servoBodyGeo, servoBodyMat);
    servoBody.position.set(0, 1.0, 0);
    trackScannerPost.add(servoBody);

    // Rotating Servo Shaft + Horn + HC-SR04 Sensor Assembly
    const servoRotatingGroup = new THREE.Group();
    servoRotatingGroup.position.set(0, 1.5, 0);
    servoGroupRef.current = servoRotatingGroup;
    trackScannerPost.add(servoRotatingGroup);

    // White Servo Horn (Cross / Arm)
    const hornGeo = new THREE.BoxGeometry(0.65, 0.06, 0.14);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(0, 0.04, 0);
    servoRotatingGroup.add(horn);

    // HC-SR04 ULTRASONIC SENSOR ASSEMBLY
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(0, 0.35, 0);
    servoRotatingGroup.add(sensorGroup);

    // Sensor Blue PCB
    const sensorPcbGeo = new THREE.BoxGeometry(1.4, 0.65, 0.08);
    const sensorPcbMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
    const sensorPcb = new THREE.Mesh(sensorPcbGeo, sensorPcbMat);
    sensorPcb.castShadow = true;
    sensorGroup.add(sensorPcb);

    // Two Silver Transducer Barrels (T = Transmitter, R = Receiver)
    const barrelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.45, 24);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.88,
      roughness: 0.15
    });

    // Barrel T (Left - Transmitter)
    const barrelT = new THREE.Mesh(barrelGeo, barrelMat);
    barrelT.rotation.x = Math.PI / 2;
    barrelT.position.set(-0.4, 0, 0.24);
    sensorGroup.add(barrelT);

    // Mesh Grille T
    const grilleGeo = new THREE.CircleGeometry(0.22, 16);
    const grilleMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const grilleT = new THREE.Mesh(grilleGeo, grilleMat);
    grilleT.position.set(-0.4, 0, 0.47);
    sensorGroup.add(grilleT);

    // Barrel R (Right - Receiver)
    const barrelR = new THREE.Mesh(barrelGeo, barrelMat);
    barrelR.rotation.x = Math.PI / 2;
    barrelR.position.set(0.4, 0, 0.24);
    sensorGroup.add(barrelR);

    // Mesh Grille R
    const grilleR = new THREE.Mesh(grilleGeo, grilleMat);
    grilleR.position.set(0.4, 0, 0.47);
    sensorGroup.add(grilleR);

    // Crystal Oscillator Silver Can
    const crystalGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12);
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.9 });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.rotation.z = Math.PI / 2;
    crystal.position.set(0, -0.15, 0.06);
    sensorGroup.add(crystal);

    // Scanning Arc Radar Wedge on floor
    const arcRadius = 16;
    const arcGeo = new THREE.RingGeometry(0.5, arcRadius, 32, 1, 0, Math.PI / 2);
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const radarArc = new THREE.Mesh(arcGeo, arcMat);
    radarArc.rotation.x = -Math.PI / 2;
    radarArc.position.set(0, 0.02, 0);
    trackScannerPost.add(radarArc);
    radarArcMeshRef.current = radarArc;

    scene.add(trackScannerPost);

    // 11. ULTRASONIC WAVE PULSES (TRANSMITTED & REFLECTED)
    // Transmitted Waves: Curved glowing arcs expanding forward from HC-SR04
    const transmittedWavesGroup = new THREE.Group();
    transmittedWavesRef.current = transmittedWavesGroup;
    scene.add(transmittedWavesGroup);

    // Create 6 wave arc meshes for transmitted pulse
    const WAVE_ARC_COUNT = 6;
    for (let i = 0; i < WAVE_ARC_COUNT; i++) {
      const waveGeo = new THREE.TorusGeometry(1, 0.035, 12, 32, Math.PI / 3);
      const waveMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });
      const waveMesh = new THREE.Mesh(waveGeo, waveMat);
      waveMesh.rotation.x = Math.PI / 2;
      waveMesh.visible = false;
      transmittedWavesGroup.add(waveMesh);
    }

    // Reflected Waves (Echo returning back from obstacle)
    const reflectedWavesGroup = new THREE.Group();
    reflectedWavesRef.current = reflectedWavesGroup;
    scene.add(reflectedWavesGroup);

    for (let i = 0; i < WAVE_ARC_COUNT; i++) {
      const echoGeo = new THREE.TorusGeometry(1, 0.035, 12, 32, Math.PI / 3);
      const echoMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b, // Amber echo
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });
      const echoMesh = new THREE.Mesh(echoGeo, echoMat);
      echoMesh.rotation.x = Math.PI / 2;
      echoMesh.visible = false;
      reflectedWavesGroup.add(echoMesh);
    }

    // 12. OBSTACLE ON TRACK
    const obstacleGroup = new THREE.Group();
    obstacleGroupRef.current = obstacleGroup;

    // Obstacle Box/Cylinder on track
    const obsGeo = new THREE.BoxGeometry(1.2, 1.4, 0.8);
    const obsMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.5,
      metalness: 0.2
    });
    const obstacleMesh = new THREE.Mesh(obsGeo, obsMat);
    obstacleMesh.position.set(0, 0.7, 0);
    obstacleMesh.castShadow = true;
    obstacleGroup.add(obstacleMesh);
    obstacleMeshRef.current = obstacleMesh;

    // Danger Pulsing Halo / Aura under obstacle
    const dangerGeo = new THREE.RingGeometry(0.8, 1.5, 32);
    const dangerMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const dangerAura = new THREE.Mesh(dangerGeo, dangerMat);
    dangerAura.rotation.x = -Math.PI / 2;
    dangerAura.position.set(0, 0.05, 0);
    obstacleGroup.add(dangerAura);
    dangerAuraRef.current = dangerAura;

    scene.add(obstacleGroup);

    // 13. SAFETY ZONE VISUAL STRIPES ON TRACK (Floor indicators)
    const zonesGroup = new THREE.Group();
    zonesGroup.position.set(0, 0.03, 0);

    // Danger Zone (<20cm scaled to 3D units: z = 0 to 3.5)
    const dangerZoneMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.5),
      new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
    );
    dangerZoneMesh.rotation.x = -Math.PI / 2;
    dangerZoneMesh.position.set(0, 0, 1.75);
    zonesGroup.add(dangerZoneMesh);

    // Warning Zone (20-50cm: z = 3.5 to 8.5)
    const warningZoneMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 5.0),
      new THREE.MeshBasicMaterial({ color: 0xeab308, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
    );
    warningZoneMesh.rotation.x = -Math.PI / 2;
    warningZoneMesh.position.set(0, 0, 6.0);
    zonesGroup.add(warningZoneMesh);

    // Safe Zone (>50cm: z = 8.5 to 16.0)
    const safeZoneMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 7.5),
      new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.05, side: THREE.DoubleSide })
    );
    safeZoneMesh.rotation.x = -Math.PI / 2;
    safeZoneMesh.position.set(0, 0, 12.25);
    zonesGroup.add(safeZoneMesh);

    scene.add(zonesGroup);

    // Animation Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();

      // Animate wave pulses
      if (isPlaying && showWaveRays) {
        waveTimeRef.current += delta * 2.8;
        const cycle = waveTimeRef.current;

        // Position of HC-SR04 in world coordinates
        const sensorWorldPos = new THREE.Vector3();
        if (sensorGroup) sensorGroup.getWorldPosition(sensorWorldPos);

        // Position of obstacle in world coordinates
        const obsWorldPos = new THREE.Vector3();
        if (obstacleGroup) obstacleGroup.getWorldPosition(obsWorldPos);

        // Distance in 3D units
        const distance3D = sensorWorldPos.distanceTo(obsWorldPos);
        const heading = obsWorldPos.clone().sub(sensorWorldPos).normalize();

        // 1. Transmitted pulses
        if (transmittedWavesRef.current) {
          const children = transmittedWavesRef.current.children;
          children.forEach((mesh: any, i) => {
            const phase = (cycle + i * (1.0 / WAVE_ARC_COUNT)) % 1.0;
            const currentDist = phase * distance3D;
            
            // Place arc along line to obstacle
            mesh.position.copy(sensorWorldPos).addScaledVector(heading, currentDist);
            mesh.lookAt(obsWorldPos);
            
            // Scale arc as it expands
            const arcScale = 0.4 + currentDist * 0.22;
            mesh.scale.set(arcScale, arcScale, arcScale);

            // Fade opacity
            mesh.visible = isObstaclePresent || currentDist < 12;
            mesh.material.opacity = Math.max(0, (1 - phase) * 0.85);
          });
        }

        // 2. Reflected pulses (Echo returning from obstacle back to sensor)
        if (reflectedWavesRef.current) {
          const children = reflectedWavesRef.current.children;
          children.forEach((mesh: any, i) => {
            const phase = (cycle + 0.5 + i * (1.0 / WAVE_ARC_COUNT)) % 1.0;
            const currentDist = phase * distance3D;
            
            // Travels backward from obstacle to sensor
            const echoHeading = sensorWorldPos.clone().sub(obsWorldPos).normalize();
            mesh.position.copy(obsWorldPos).addScaledVector(echoHeading, currentDist);
            mesh.lookAt(sensorWorldPos);

            const arcScale = 0.5 + currentDist * 0.18;
            mesh.scale.set(arcScale, arcScale, arcScale);

            mesh.visible = isObstaclePresent;
            mesh.material.opacity = Math.max(0, (1 - phase) * 0.7);
          });
        }
      }

      // Animate danger aura pulsing
      if (dangerAuraRef.current) {
        const pulse = Math.sin(clock.getElapsedTime() * 6) * 0.5 + 0.5;
        dangerAuraRef.current.scale.set(1 + pulse * 0.3, 1 + pulse * 0.3, 1);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  // Update Servo rotation based on context angle (0° to 90°)
  useEffect(() => {
    if (servoGroupRef.current) {
      // Map 0° -> 90° to radians (pointing along track z-axis)
      // 45° is straight down the track (0 radians or perpendicular)
      const rad = THREE.MathUtils.degToRad(servoAngle - 45);
      servoGroupRef.current.rotation.y = -rad;
    }
  }, [servoAngle]);

  // Update Obstacle position, visibility, material, and rotation
  useEffect(() => {
    if (obstacleGroupRef.current) {
      obstacleGroupRef.current.visible = isObstaclePresent;
      
      // Map obstacleDistance (5 to 100 cm) to 3D track Z-position (1 to 15 units)
      const zPos = (obstacleDistance / 100) * 14.0 + 0.8;
      obstacleGroupRef.current.position.set(0, 0, zPos);
      obstacleGroupRef.current.rotation.y = THREE.MathUtils.degToRad(obstacleAngle);
    }

    if (obstacleMeshRef.current) {
      const matProps = MATERIALS_DATA[obstacleMaterial];
      const mat = obstacleMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(matProps.color);
      mat.roughness = matProps.roughness === 'Smooth' ? 0.2 : matProps.roughness === 'Medium' ? 0.6 : 0.9;
      mat.metalness = obstacleMaterial === 'metal' ? 0.85 : 0.1;
    }
  }, [obstacleDistance, obstacleAngle, obstacleMaterial, isObstaclePresent]);

  // Update LED colors and lights in physical sync with status
  useEffect(() => {
    const status = telemetry.status;

    // Green LED
    if (greenLedRef.current && greenLightRef.current) {
      const isGreenOn = status === 'SAFE';
      (greenLedRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = isGreenOn ? 1.5 : 0.1;
      greenLightRef.current.intensity = isGreenOn ? 2.5 : 0;
    }

    // Yellow LED
    if (yellowLedRef.current && yellowLightRef.current) {
      const isYellowOn = status === 'WARNING';
      (yellowLedRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = isYellowOn ? 1.6 : 0.1;
      yellowLightRef.current.intensity = isYellowOn ? 2.8 : 0;
    }

    // Red LED
    if (redLedRef.current && redLightRef.current) {
      const isRedOn = status === 'DANGER';
      (redLedRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = isRedOn ? 2.2 : 0.1;
      redLightRef.current.intensity = isRedOn ? 3.5 : 0;
    }

    // Danger halo visibility
    if (dangerAuraRef.current) {
      dangerAuraRef.current.visible = isObstaclePresent && status === 'DANGER';
    }
  }, [telemetry.status, isObstaclePresent]);

  // Camera preset controller
  const setCameraView = (view: 'overview' | 'sensor' | 'driver' | 'top' | 'bench') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraPreset(view);
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (view) {
      case 'overview':
        cam.position.set(11, 9, 14);
        ctrl.target.set(0, 1, 3);
        break;
      case 'sensor':
        // Close-up on the HC-SR04 sensor and servo
        cam.position.set(3.2, 3.2, 1.2);
        ctrl.target.set(1.9, 1.8, -0.5);
        break;
      case 'driver':
        // Looking forward down the railway track from train cab
        cam.position.set(0, 2.0, -8.0);
        ctrl.target.set(0, 1.2, 12.0);
        break;
      case 'top':
        // Top-down Radar view
        cam.position.set(0, 22, 4);
        ctrl.target.set(0, 0, 4);
        break;
      case 'bench':
        // Close-up on Arduino and Breadboard with LEDs
        cam.position.set(4.8, 3.2, -1.2);
        ctrl.target.set(3.6, 1.2, -2.4);
        break;
    }
    ctrl.update();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-2xl">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Telemetry & Status HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none flex flex-wrap items-center justify-between gap-3">
        {/* Status Badge */}
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full animate-ping ${
                telemetry.status === 'SAFE'
                  ? 'bg-emerald-400'
                  : telemetry.status === 'WARNING'
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
            />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">System Status:</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
            {telemetry.status === 'SAFE' && (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                TRACK CLEAR
              </span>
            )}
            {telemetry.status === 'WARNING' && (
              <span className="text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                WARNING ZONE
              </span>
            )}
            {telemetry.status === 'DANGER' && (
              <span className="text-rose-400 flex items-center gap-1.5 animate-pulse">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                OBSTACLE DETECTED!
              </span>
            )}
          </div>

          {/* Quick breadboard LED mirror indicator */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-700 text-xs text-slate-400 font-mono">
            <span>LEDs:</span>
            <div
              title="Green LED (Safe)"
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                telemetry.status === 'SAFE' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-emerald-950/80 border border-emerald-900'
              }`}
            />
            <div
              title="Yellow LED (Warning)"
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                telemetry.status === 'WARNING' ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-amber-950/80 border border-amber-900'
              }`}
            />
            <div
              title="Red LED (Danger)"
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                telemetry.status === 'DANGER' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-rose-950/80 border border-rose-900'
              }`}
            />
          </div>
        </div>

        {/* Live Physics Metrics Pill Strip */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 text-xs font-mono">
          <div className="flex flex-col px-2">
            <span className="text-[10px] text-slate-400 uppercase">Distance</span>
            <span className="text-cyan-400 font-semibold">{telemetry.measuredDistance.toFixed(1)} cm</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex flex-col px-2">
            <span className="text-[10px] text-slate-400 uppercase">ToF</span>
            <span className="text-amber-400 font-semibold">{telemetry.timeOfFlight} μs</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex flex-col px-2">
            <span className="text-[10px] text-slate-400 uppercase">Servo</span>
            <span className="text-indigo-400 font-semibold">{servoAngle}°</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="hidden md:flex flex-col px-2">
            <span className="text-[10px] text-slate-400 uppercase">Sound Speed</span>
            <span className="text-slate-200 font-semibold">{telemetry.speedOfSound} m/s</span>
          </div>
        </div>
      </div>

      {/* Demonstration Banner if Active */}
      {isDemonstrating && (
        <div className="absolute top-20 left-4 right-4 pointer-events-none flex justify-center">
          <div className="pointer-events-auto max-w-2xl bg-gradient-to-r from-cyan-950/90 via-blue-950/90 to-indigo-950/90 border border-cyan-500/50 backdrop-blur-md rounded-xl p-3.5 shadow-2xl flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 animate-spin" />
            <div className="flex-1 text-xs">
              <span className="text-cyan-300 font-semibold uppercase tracking-wider block mb-0.5">
                Cinematic Demonstration Tour Mode
              </span>
              <p className="text-slate-200">{demonstrationDescription}</p>
            </div>
          </div>
        </div>
      )}

      {/* Camera View Switcher Buttons (Bottom Left) */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl text-xs">
        <span className="px-2 text-[11px] font-mono text-slate-400 hidden sm:inline">Camera:</span>
        <button
          onClick={() => setCameraView('overview')}
          className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
            cameraPreset === 'overview'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setCameraView('sensor')}
          className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
            cameraPreset === 'sensor'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          HC-SR04 Mount
        </button>
        <button
          onClick={() => setCameraView('driver')}
          className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
            cameraPreset === 'driver'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Train Driver POV
        </button>
        <button
          onClick={() => setCameraView('bench')}
          className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
            cameraPreset === 'bench'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Arduino & Breadboard
        </button>
        <button
          onClick={() => setCameraView('top')}
          className={`px-2.5 py-1.5 rounded font-medium transition-colors ${
            cameraPreset === 'top'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          Top Radar
        </button>
      </div>

      {/* Visual Overlays Toggle (Bottom Right) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-xl text-xs font-mono">
        <button
          onClick={() => setShowWaveRays(!showWaveRays)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors ${
            showWaveRays ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle animated ultrasonic wave propagation"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ultrasonic Waves</span>
        </button>
        <button
          onClick={() => setCameraView('overview')}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          title="Reset Camera Orientation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
