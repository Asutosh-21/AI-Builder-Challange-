"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, Orbit, Radio } from "lucide-react";

interface SatelliteHeroCanvasProps {
  satelliteId?: string;
  altitude?: number;
  velocity?: number;
  status?: string;
  orbit?: string;
}

export function SatelliteHeroCanvas({
  satelliteId = "SAT-4521",
  altitude = 550,
  velocity = 7.66,
  status = "Healthy",
  orbit = "LEO",
}: SatelliteHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hudPos, setHudPos] = useState({ x: 0, y: 0, visible: true });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Lighting ────────────────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(6, 4, 4);
    scene.add(sunLight);

    const earthReflection = new THREE.DirectionalLight(0x00d4ff, 1.2);
    earthReflection.position.set(-4, -5, -2);
    scene.add(earthReflection);

    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.8);
    scene.add(ambientLight);

    // ── Earth Horizon Curvature at Bottom ────────────────────────────────────
    const earthGeometry = new THREE.SphereGeometry(18, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a224a,
      roughness: 0.8,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(0, -19.4, -2);
    scene.add(earth);

    // Atmosphere Rim Glow
    const atmosphereGeometry = new THREE.SphereGeometry(18.2, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.0, 0.7, 1.0, 1.0) * intensity * 1.8;
        }
      `,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.position.copy(earth.position);
    scene.add(atmosphere);

    // ── Starfield ───────────────────────────────────────────────────────────
    const starsCount = 400;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 40;
      starPositions[i * 3 + 1] = Math.random() * 20 - 4;
      starPositions[i * 3 + 2] = -10 - Math.random() * 20;

      const c = Math.random() > 0.8 ? new THREE.Color(0x38bdf8) : new THREE.Color(0xffffff);
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // ── 3D Satellite Model ──────────────────────────────────────────────────
    const satelliteGroup = new THREE.Group();
    satelliteGroup.position.set(0.6, 0.3, 0);

    // 1. Satellite Bus (Main Body)
    const busGeometry = new THREE.BoxGeometry(0.9, 0.9, 1.4);
    const busMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Gold foil thermal insulation
      metalness: 0.85,
      roughness: 0.25,
      bumpScale: 0.05,
    });
    const bus = new THREE.Mesh(busGeometry, busMaterial);
    satelliteGroup.add(bus);

    // Titanium structural ribs / instrumentation section
    const ribGeometry = new THREE.CylinderGeometry(0.42, 0.42, 1.44, 24);
    const ribMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.2,
    });
    const rib = new THREE.Mesh(ribGeometry, ribMaterial);
    rib.rotation.x = Math.PI / 2;
    satelliteGroup.add(rib);

    // 2. Optical Sensor Payload & Lens
    const lensRingGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.35, 32);
    const lensRingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
    const lensRing = new THREE.Mesh(lensRingGeo, lensRingMat);
    lensRing.position.set(0, 0, 0.8);
    lensRing.rotation.x = Math.PI / 2;
    satelliteGroup.add(lensRing);

    const lensGlassGeo = new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lensGlassMat = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.4,
      roughness: 0.05,
      metalness: 0.95,
    });
    const lensGlass = new THREE.Mesh(lensGlassGeo, lensGlassMat);
    lensGlass.position.set(0, 0, 0.92);
    lensGlass.rotation.x = Math.PI / 2;
    satelliteGroup.add(lensGlass);

    // 3. High-Gain Parabolic Communications Dish
    const dishMastGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12);
    const dishMastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const dishMast = new THREE.Mesh(dishMastGeo, dishMastMat);
    dishMast.position.set(0, 0.65, 0);
    satelliteGroup.add(dishMast);

    const dishGeo = new THREE.SphereGeometry(0.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      side: THREE.DoubleSide,
      metalness: 0.4,
      roughness: 0.3,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(0, 0.95, 0);
    dish.rotation.x = -Math.PI / 3;
    dish.rotation.z = Math.PI / 6;
    satelliteGroup.add(dish);

    // Dish sub-reflector feed horn
    const feedGeo = new THREE.ConeGeometry(0.06, 0.2, 12);
    const feedMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.6 });
    const feed = new THREE.Mesh(feedGeo, feedMat);
    feed.position.set(0, 1.05, 0.1);
    feed.rotation.x = Math.PI / 2;
    satelliteGroup.add(feed);

    // 4. Photovoltaic Solar Array Wings (Left & Right)
    const solarWingGroupLeft = new THREE.Group();
    const solarWingGroupRight = new THREE.Group();

    // Solar Panel Geometry
    const panelGeo = new THREE.BoxGeometry(2.2, 0.04, 0.85);
    
    // Create Solar Cell Texture on Canvas
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0c1836";
      ctx.fillRect(0, 0, 512, 256);
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth = 1.5;
      
      // Grid lines
      for (let x = 0; x <= 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }
      for (let y = 0; y <= 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }
      // Cell highlight glints
      ctx.fillStyle = "#1e3a8a";
      for (let i = 0; i < 32; i++) {
        const rx = Math.floor(Math.random() * 16) * 32 + 4;
        const ry = Math.floor(Math.random() * 8) * 32 + 4;
        ctx.fillRect(rx, ry, 24, 24);
      }
    }
    const solarTexture = new THREE.CanvasTexture(canvas);
    solarTexture.wrapS = THREE.RepeatWrapping;
    solarTexture.wrapT = THREE.RepeatWrapping;

    const solarMat = new THREE.MeshStandardMaterial({
      map: solarTexture,
      color: 0x2563eb,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x0369a1,
      emissiveIntensity: 0.15,
    });

    const panelLeft = new THREE.Mesh(panelGeo, solarMat);
    panelLeft.position.set(-1.6, 0, 0);
    solarWingGroupLeft.add(panelLeft);

    const boomLeftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12);
    const boomLeft = new THREE.Mesh(boomLeftGeo, dishMastMat);
    boomLeft.rotation.z = Math.PI / 2;
    boomLeft.position.set(-0.6, 0, 0);
    solarWingGroupLeft.add(boomLeft);

    const panelRight = new THREE.Mesh(panelGeo, solarMat);
    panelRight.position.set(1.6, 0, 0);
    solarWingGroupRight.add(panelRight);

    const boomRight = new THREE.Mesh(boomLeftGeo, dishMastMat);
    boomRight.rotation.z = Math.PI / 2;
    boomRight.position.set(0.6, 0, 0);
    solarWingGroupRight.add(boomRight);

    satelliteGroup.add(solarWingGroupLeft);
    satelliteGroup.add(solarWingGroupRight);

    // 5. Thruster & Ion Propulsion Glow
    const thrusterGeo = new THREE.CylinderGeometry(0.12, 0.2, 0.3, 16);
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95 });
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.position.set(0, 0, -0.85);
    thruster.rotation.x = Math.PI / 2;
    satelliteGroup.add(thruster);

    const plumeGeo = new THREE.ConeGeometry(0.18, 0.6, 16);
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const plume = new THREE.Mesh(plumeGeo, plumeMat);
    plume.position.set(0, 0, -1.25);
    plume.rotation.x = -Math.PI / 2;
    satelliteGroup.add(plume);

    // Initial Satellite Orientation
    satelliteGroup.rotation.y = THREE.MathUtils.degToRad(-25);
    satelliteGroup.rotation.x = THREE.MathUtils.degToRad(12);
    satelliteGroup.rotation.z = THREE.MathUtils.degToRad(8);
    scene.add(satelliteGroup);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = satelliteGroup.rotation.x;
    let targetRotationY = satelliteGroup.rotation.y;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / height) * 2 - 1);
      mouseX = x;
      mouseY = y;
      targetRotationY = THREE.MathUtils.degToRad(-25) + mouseX * 0.4;
      targetRotationX = THREE.MathUtils.degToRad(12) - mouseY * 0.3;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // ── Animation Loop ──────────────────────────────────────────────────────
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating orbital drift
      satelliteGroup.position.y = 0.3 + Math.sin(elapsedTime * 1.2) * 0.08;
      satelliteGroup.position.x = 0.6 + Math.cos(elapsedTime * 0.9) * 0.05;

      // Ion plume flicker
      plume.scale.set(
        1 + Math.sin(elapsedTime * 20) * 0.15,
        1 + Math.cos(elapsedTime * 25) * 0.2,
        1 + Math.sin(elapsedTime * 20) * 0.15
      );

      // Interpolate rotation towards mouse target
      satelliteGroup.rotation.y += (targetRotationY - satelliteGroup.rotation.y) * 0.05;
      satelliteGroup.rotation.x += (targetRotationX - satelliteGroup.rotation.x) * 0.05;

      // Earth slight atmospheric rotation
      earth.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);

      // Project 3D satellite position to 2D screen coordinates for HUD tracker
      const satScreenPos = new THREE.Vector3();
      satelliteGroup.getWorldPosition(satScreenPos);
      satScreenPos.add(new THREE.Vector3(0.5, 0.4, 0)); // Offset towards top-right of satellite
      satScreenPos.project(camera);

      const screenX = ((satScreenPos.x + 1) / 2) * width;
      const screenY = ((-satScreenPos.y + 1) / 2) * height;

      setHudPos({ x: screenX, y: screenY, visible: true });
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full h-[360px] md:h-[480px] lg:h-[540px] overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      {/* HUD Telemetry Callout Card (Floating in 3D Space) */}
      {hudPos.visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            left: `${Math.max(20, Math.min(hudPos.x + 30, (containerRef.current?.clientWidth || 600) - 260))}px`,
            top: `${Math.max(20, Math.min(hudPos.y - 80, (containerRef.current?.clientHeight || 400) - 160))}px`,
          }}
          className="z-20 pointer-events-auto"
        >
          {/* Glowing HUD Card */}
          <div className="relative rounded-xl bg-[#091124]/90 border border-cyan-500/40 p-3.5 shadow-2xl backdrop-blur-xl ring-1 ring-cyan-400/20 w-[220px]">
            {/* Pointer Line Anchor Indicator */}
            <div className="absolute -left-2 top-6 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff] animate-ping" />
            <div className="absolute -left-2 top-6 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00d4ff]" />

            {/* Satellite Header & Status */}
            <div className="flex items-center justify-between border-b border-sky-900/60 pb-2 mb-2">
              <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-white">
                <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>{satelliteId}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{status}</span>
              </div>
            </div>

            {/* Real-time Parameters */}
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Altitude:</span>
                <span className="font-semibold text-cyan-300">{altitude} km</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Velocity:</span>
                <span className="font-semibold text-sky-200">{velocity} km/s</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Orbit:</span>
                <span className="font-semibold text-white px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800/60 text-[10px]">
                  {orbit}
                </span>
              </div>
            </div>

            {/* Sub-bar */}
            <div className="mt-2.5 pt-2 border-t border-sky-900/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Sensor telemetry</span>
              <span className="text-cyan-400 font-bold">100% OK</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating 3D Navigation Controls Guide */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-sky-900/40 text-[11px] text-slate-400 backdrop-blur-md">
        <Orbit className="h-3.5 w-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
        <span>Interactive 3D Spacecraft · Hover / Move to Orbit</span>
      </div>
    </div>
  );
}