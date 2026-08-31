"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Globe } from "lucide-react";

interface OrbitGlobeCanvasProps {
  onSelectSatellite?: (sat: any) => void;
}

export function OrbitGlobeCanvas({ onSelectSatellite }: OrbitGlobeCanvasProps) {
  // canvasWrapRef  → the div that Three.js appends its <canvas> into
  // overlayRef     → absolute overlay for HUD controls (sits on top of canvas)
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState({ active: true, debris: true, other: true });

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    let rafId: number;

    // ── Helpers ──────────────────────────────────────────────────────────────
    const W = () => wrap.clientWidth  || wrap.offsetWidth  || 600;
    const H = () => wrap.clientHeight || wrap.offsetHeight || 390;

    // ── Scene / Camera / Renderer ─────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 1000);
    camera.position.set(0, 1.5, 4.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.setSize(W(), H());

    // Make the canvas fill its parent and block-display (no inline gap)
    const cv = renderer.domElement;
    cv.style.display = "block";
    cv.style.width   = "100%";
    cv.style.height  = "100%";
    wrap.appendChild(cv);

    // ── Lighting ──────────────────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x00d4ff, 0.8);
    fillLight.position.set(-5, -3, -2);
    scene.add(fillLight);

    scene.add(new THREE.AmbientLight(0x0f172a, 1.2));

    // ── Earth Globe with procedural canvas texture ────────────────────────────
    const R = 1.15; // globe radius
    const texCanvas = document.createElement("canvas");
    texCanvas.width  = 1024;
    texCanvas.height = 512;
    const ctx = texCanvas.getContext("2d")!;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#081b3b");
    grad.addColorStop(0.5, "#0b2554");
    grad.addColorStop(1, "#081b3b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = "#1e3a8a";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    const continents: [number, number, number, number, number][] = [
      [280, 160, 90, 60, -0.2],   // N. America
      [340, 320, 55, 90,  0.2],   // S. America
      [650, 150, 140, 70, 0.1],   // Eurasia
      [550, 260, 65, 80,  0],     // Africa
      [820, 340, 50, 40, -0.2],   // Australia
    ];
    for (const [cx, cy, rx, ry, rot] of continents) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(0,212,255,0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1024; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
    for (let y = 0; y <= 512;  y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke(); }

    // city-light dots (static seed — no Math.random in render path)
    ctx.fillStyle = "#38bdf8";
    const dots = [
      [280,155],[300,160],[260,145],[220,170],[340,320],[330,310],[650,145],[670,155],[690,160],
      [550,255],[560,265],[820,340],[830,345],[810,335],[400,130],[420,140],[500,200],[700,200],
      [750,220],[600,300],[100,200],[120,210],[900,150],[950,160],[180,280],[200,290],[450,350],
    ];
    for (const [dx, dy] of dots) ctx.fillRect(dx, dy, 2, 2);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(R, 64, 64),
      new THREE.MeshStandardMaterial({
        map: new THREE.CanvasTexture(texCanvas),
        roughness: 0.7,
        metalness: 0.2,
        emissive: 0x071b3e,
        emissiveIntensity: 0.3,
      }),
    );
    scene.add(earth);

    // Atmosphere glow
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.06, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        vertexShader: `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vNormal; void main(){ float i=pow(0.65-dot(vNormal,vec3(0,0,1)),2.8); gl_FragColor=vec4(0,0.8,1,1)*i*1.5; }`,
      }),
    ));

    // ── Orbit rings ───────────────────────────────────────────────────────────
    const makeRing = (r: number, tx: number, ty: number, col: number) => {
      const pts = new THREE.EllipseCurve(0,0,r,r,0,Math.PI*2,false,0).getPoints(120);
      const g   = new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(p.x,0,p.y)));
      const ring = new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.45 }));
      ring.rotation.x = tx; ring.rotation.y = ty;
      return ring;
    };
    const ring1 = makeRing(R*1.35,  Math.PI/4,   0.3, 0x00d4ff);
    const ring2 = makeRing(R*1.55, -Math.PI/3,   0.6, 0x38bdf8);
    const ring3 = makeRing(R*1.9,   Math.PI/6,  -0.4, 0x818cf8);
    scene.add(ring1, ring2, ring3);

    // ── Satellites ────────────────────────────────────────────────────────────
    const SATS = [
      { type:"active", radius:R*1.35, speed:0.8,  angle:0.2, tiltX:Math.PI/4,   color:0x10b981 },
      { type:"active", radius:R*1.6,  speed:0.5,  angle:1.4, tiltX:-Math.PI/3,  color:0x10b981 },
      { type:"active", radius:R*1.4,  speed:0.75, angle:2.8, tiltX:Math.PI/5,   color:0x10b981 },
      { type:"active", radius:R*1.38, speed:0.78, angle:4.1, tiltX:Math.PI/3.5, color:0xef4444 },
      { type:"active", radius:R*1.9,  speed:0.3,  angle:5.2, tiltX:Math.PI/6,   color:0x10b981 },
      { type:"debris", radius:R*1.36, speed:0.82, angle:3.9, tiltX:Math.PI/3.2, color:0xef4444 },
      { type:"debris", radius:R*1.48, speed:0.65, angle:0.8, tiltX:-Math.PI/4,  color:0xef4444 },
      { type:"debris", radius:R*1.52, speed:0.6,  angle:2.1, tiltX:Math.PI/2.8, color:0xef4444 },
      { type:"other",  radius:R*1.28, speed:0.9,  angle:1.1, tiltX:Math.PI/3.6, color:0x38bdf8 },
      { type:"other",  radius:R*1.34, speed:0.81, angle:3.3, tiltX:Math.PI/6.2, color:0x38bdf8 },
    ];
    const meshes = SATS.map(d => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.038,16,16), new THREE.MeshBasicMaterial({ color:d.color }));
      scene.add(m);
      return { mesh:m, data:d };
    });

    // ── Drag rotate ───────────────────────────────────────────────────────────
    let dragging = false, px = 0, py = 0;
    const onDown  = (e:MouseEvent) => { dragging=true; px=e.clientX; py=e.clientY; };
    const onUp    = () => { dragging=false; };
    const onMove  = (e:MouseEvent) => {
      if (!dragging) return;
      earth.rotation.y += (e.clientX-px)*0.005;
      earth.rotation.x += (e.clientY-py)*0.005;
      ring1.rotation.y += (e.clientX-px)*0.003;
      ring2.rotation.y += (e.clientX-px)*0.003;
      ring3.rotation.y += (e.clientX-px)*0.003;
      px=e.clientX; py=e.clientY;
    };
    wrap.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",  onUp);
    window.addEventListener("mousemove",onMove);

    // ── Animation loop ────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      if (!dragging) { earth.rotation.y += 0.002; ring1.rotation.z = t*0.02; ring2.rotation.z = -t*0.015; }
      meshes.forEach(({ mesh, data }) => {
        mesh.visible = (
          (data.type==="active" && activeLayer.active) ||
          (data.type==="debris" && activeLayer.debris) ||
          (data.type==="other"  && activeLayer.other)
        );
        if (!mesh.visible) return;
        const a = data.angle + t * data.speed * 0.4;
        const pos = new THREE.Vector3(Math.cos(a)*data.radius, 0, Math.sin(a)*data.radius);
        pos.applyAxisAngle(new THREE.Vector3(1,0,0), data.tiltX);
        pos.applyAxisAngle(new THREE.Vector3(0,1,0), earth.rotation.y);
        mesh.position.copy(pos);
      });
      renderer.render(scene, camera);
    };
    tick();

    // ── Resize handling ───────────────────────────────────────────────────────
    const onResize = () => {
      const w = W(), h = H();
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    // Defer one frame so the browser has painted the container dimensions
    requestAnimationFrame(onResize);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      wrap.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",  onUp);
      window.removeEventListener("mousemove",onMove);
      if (cv.parentNode === wrap) wrap.removeChild(cv);
      renderer.dispose();
    };
  }, [activeLayer]);

  return (
    /**
     * Outer: fills whatever sized box the parent gives it.
     * Use width/height 100% so it works in any container.
     * position:relative so the overlay can be absolutely placed.
     */
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* Three.js canvas is appended here by useEffect */}
      <div
        ref={canvasWrapRef}
        style={{ position: "absolute", inset: 0, overflow: "hidden" }}
        className="cursor-grab active:cursor-grabbing"
      />

      {/* HUD overlay — sits on top of canvas, pointer-events controlled per element */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

        {/* Top bar */}
        <div style={{ padding: "12px 12px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ pointerEvents: "auto" }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#091124]/90 border border-cyan-500/30 backdrop-blur-md text-[11px] font-medium text-cyan-400">
            <Globe className="h-3.5 w-3.5" />
            <span>3D Orbit Map</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-[#091124]/80 px-2 py-0.5 rounded border border-sky-900/40">
            LEO / MEO / GEO
          </span>
        </div>

        {/* Bottom legend — layer toggles */}
        <div style={{ padding: "0 12px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ pointerEvents: "auto" }}
            className="flex items-center gap-3 bg-[#091124]/90 border border-sky-900/50 px-3 py-1.5 rounded-xl backdrop-blur-md">
            {[
              { key: "active" as const, label: "Active Satellites", color: "#10b981", glow: "#10b981" },
              { key: "debris" as const, label: "Debris Objects",    color: "#ef4444", glow: "#ef4444" },
              { key: "other"  as const, label: "Other Objects",     color: "#38bdf8", glow: "#38bdf8" },
            ].map(({ key, label, color, glow }) => (
              <button
                key={key}
                onClick={() => setActiveLayer(p => ({ ...p, [key]: !p[key] }))}
                className={`flex items-center gap-1.5 text-[11px] font-medium transition-opacity ${activeLayer[key] ? "opacity-100" : "opacity-40 text-slate-400"}`}
                style={activeLayer[key] ? { color } : undefined}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color, boxShadow: `0 0 6px ${glow}`, display: "inline-block", flexShrink: 0 }} />
                {label}
              </button>
            ))}
          </div>
          <span className="hidden md:block text-[10px] text-slate-400 font-mono">
            Drag to rotate · Real-time
          </span>
        </div>
      </div>
    </div>
  );
}
