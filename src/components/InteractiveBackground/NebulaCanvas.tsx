"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Tier } from "@/lib/tier";
import styles from "./InteractiveBackground.module.css";

interface NebulaProps {
  step: 1 | 2 | 3;
  warpRef: React.MutableRefObject<number>;
  tier: Tier;
  onReady: () => void;
  onFail: () => void;
}

/* ============================================================
   CONFIG PAR TIER
   ============================================================ */
const TIERS = {
  high: { dpr: [1.5, 1.25, 1], nebK: 0.7, octaves: 4, glow: true, streaks: 900, detail: 2, fps: 0 },
  mid: { dpr: [1.25, 1, 0.85], nebK: 0.6, octaves: 3, glow: true, streaks: 440, detail: 2, fps: 0 },
  low: { dpr: [1, 0.85, 0.75], nebK: 0.45, octaves: 3, glow: false, streaks: 200, detail: 1, fps: 30 },
} as const;

/* ============================================================
   SHADERS
   ============================================================ */
const QUAD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const HASH = /* glsl */ `
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
`;

const nebulaFrag = (octaves: number) => /* glsl */ `
uniform vec2  uRes;
uniform float uTime;
uniform float uWarp;
uniform float uW1;
uniform float uW2;
uniform float uW3;
uniform vec3  uA;
uniform vec3  uB;
uniform vec2  uMouse;

varying vec2 vUv;

${HASH}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < ${octaves}; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return s;
}

vec3 voronoi(vec2 p, float t) {
  vec2 n = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0;
  float d2 = 8.0;
  float id = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 h = hash22(n + g);
      vec2 o = 0.5 + 0.42 * sin(t + 6.2831 * h);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; id = h.x; }
      else if (d < d2) { d2 = d; }
    }
  }
  d1 = sqrt(d1);
  d2 = sqrt(d2);
  return vec3(d1, d2 - d1, id);
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= uRes.x / uRes.y;
  float t = uTime;

  uv *= 1.0 - uWarp * 0.28;
  float r0 = length(uv);
  uv += uMouse * 0.09 * (0.35 + r0 * 0.6);

  float r = length(uv);
  float ang = atan(uv.y, uv.x);

  vec3 col = vec3(0.0);

  /* 01 CRYSTAL */
  if (uW1 > 0.001) {
    float cs = cos(t * 0.025);
    float sn = sin(t * 0.025);
    vec2 p = vec2(cs * uv.x - sn * uv.y, sn * uv.x + cs * uv.y) * 2.7;
    vec3 v = voronoi(p, t * 0.32);

    float edge  = 1.0 - smoothstep(0.0, 0.055, v.y);
    float inner = 1.0 - smoothstep(0.0, 0.5, v.x);
    float facet = 0.22 + 0.78 * v.z;
    float sweep = pow(max(0.0, sin(dot(uv, vec2(0.82, 0.57)) * 2.4 - t * 0.55 + v.z * 6.2831)), 6.0);

    float aur  = fbm(vec2(uv.x * 1.3 + t * 0.04, uv.y * 2.8 - t * 0.03));
    float band = smoothstep(0.48, 0.78, aur) * (0.55 + 0.45 * sin(uv.x * 2.6 + t * 0.35));

    vec3 c = uB * facet * (0.28 + inner * 0.22)
           + uA * edge * (0.65 + sweep * 1.4)
           + mix(uB, uA, 0.55) * sweep * facet * 0.55
           + uA * band * 0.32;

    c *= smoothstep(1.55, 0.08, r);
    col += c * uW1;
  }

  /* 02 PLASMA */
  if (uW2 > 0.001) {
    vec2 q = vec2(
      fbm(uv * 1.8 + vec2(0.0, t * 0.12)),
      fbm(uv * 1.8 + vec2(5.2, 1.3) - t * 0.10)
    );
    vec2 w = vec2(
      fbm(uv * 2.2 + q * 2.8 + vec2(1.7, 9.2) + t * 0.08),
      fbm(uv * 2.2 + q * 2.8 + vec2(8.3, 2.8) - t * 0.06)
    );
    float n = fbm(uv * 2.6 + w * 2.6);

    float fil  = pow(1.0 - abs(n * 2.0 - 1.0), 10.0);
    float body = pow(n, 1.65) * 1.9;

    vec3 c = mix(uB, uA, clamp(dot(w, w) * 0.9, 0.0, 1.0)) * body
           + mix(uA, vec3(1.0), 0.3) * fil * 0.9;

    c *= smoothstep(1.5, 0.05, r);
    col += c * uW2;
  }

  /* 03 FORGE */
  if (uW3 > 0.001) {
    vec2 sh = vec2(vnoise(uv * 6.0 + vec2(0.0, -t * 2.0)) - 0.5, 0.0) * 0.06;
    vec2 fu = uv + sh;

    float nF  = fbm(vec2(fu.x * 3.2, fu.y * 1.5 - t * 0.34));
    float nF2 = fbm(vec2(fu.x * 5.5 + 3.1, fu.y * 2.6 - t * 0.62));

    float heat = pow(max(nF, 0.0), 2.3) * 2.6 + pow(max(nF2, 0.0), 3.0) * 1.4;
    heat *= 0.75 + 0.5 * smoothstep(0.9, -0.9, fu.y);

    float ember = pow(max(fbm(vec2(fu.x * 9.0, fu.y * 4.0 - t * 1.25)), 0.0), 7.0) * 9.0;

    float v = (heat + ember) * smoothstep(1.45, 0.05, r);

    vec3 c = mix(uA, uB, clamp(v * 0.85, 0.0, 1.0)) * v;
    c += vec3(1.0, 0.85, 0.6) * pow(max(v - 1.2, 0.0), 2.0) * 0.35;

    col += c * uW3;
  }

  col += uA * (0.05 / (r * 2.0 + 0.09)) * (0.35 + uWarp * 1.6);

  float spokes = pow(abs(sin(ang * 26.0 + t * 0.4)), 10.0);
  col += uA * spokes * uWarp * 2.2 * smoothstep(0.0, 0.85, r);
  col += vec3(1.0) * uWarp * uWarp * 0.17;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

const blitFrag = (glow: boolean) => /* glsl */ `
uniform sampler2D uTex;
uniform vec2  uTexel;
uniform float uWarp;
uniform float uTime;
uniform float uGlow;

varying vec2 vUv;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 d = vUv - 0.5;
  float ca = 0.0012 + uWarp * 0.014;

  vec3 col;
  col.r = texture2D(uTex, vUv + d * ca).r;
  col.g = texture2D(uTex, vUv).g;
  col.b = texture2D(uTex, vUv - d * ca).b;

  ${
    glow
      ? `
  vec2 o = uTexel * 3.0;
  vec3 g = texture2D(uTex, vUv + vec2( o.x,  o.y)).rgb
         + texture2D(uTex, vUv + vec2(-o.x,  o.y)).rgb
         + texture2D(uTex, vUv + vec2( o.x, -o.y)).rgb
         + texture2D(uTex, vUv + vec2(-o.x, -o.y)).rgb;
  g *= 0.25;
  col += max(g - 0.18, 0.0) * uGlow;`
      : ""
  }

  float vig = clamp(1.0 - dot(d, d) * 2.1, 0.0, 1.0);
  col *= mix(0.42, 1.0, vig) + uWarp * 0.25;

  col += (hash12(gl_FragCoord.xy + fract(uTime * 7.0) * 311.0) - 0.5) * 0.04;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

const SHELL_VERT = /* glsl */ `
uniform float uTime;
uniform float uWarp;
uniform float uW1;
uniform float uW2;
uniform float uW3;

varying float vD;

void main() {
  vec3 p = position;
  vec3 n = normalize(normal);
  float t = uTime;

  float w1 = sin(p.x * 1.7 + t * 0.9) * cos(p.y * 1.4 - t * 0.7);
  float w2 = sin(p.z * 2.6 - t * 1.4) * sin(p.y * 2.1 + t * 1.1);

  float crystal = (floor((w1 * 0.5 + 0.5) * 5.0) / 5.0 - 0.5) * 1.15;
  float plasma  = (w1 * 0.55 + w2 * 0.75) * 1.25;
  float forge   = (sin(t * 1.25 + w1 * 2.1) * 0.5 + 0.5) * 0.9 - 0.45;

  float d = crystal * uW1 + plasma * uW2 + forge * uW3;
  d += uWarp * w2 * 2.3;

  vec3 disp = p + n * d;
  disp *= 1.0 + uWarp * 0.48;

  vD = d;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(disp, 1.0);
}
`;

const SHELL_FRAG = /* glsl */ `
uniform vec3  uA;
uniform vec3  uB;
uniform float uOpacity;
uniform float uWarp;

varying float vD;

void main() {
  float m = clamp(vD * 0.45 + 0.5, 0.0, 1.0);
  vec3 c = mix(uA, uB, m) + uWarp * 0.75;
  gl_FragColor = vec4(c, uOpacity * (1.0 - uWarp * 0.2));
}
`;

const STREAK_VERT = /* glsl */ `
attribute vec3  aDir;
attribute float aSeed;
attribute float aEnd;

uniform float uTime;
uniform float uWarp;
uniform float uForge;
uniform float uSwirl;

varying float vFade;
varying float vTw;

void main() {
  vec3 p = position;
  float t = uTime;

  p += aDir * sin(t * 0.5 + aSeed * 6.2831) * 0.7;

  float a = uSwirl * (0.6 + aSeed * 0.9);
  float cs = cos(a);
  float sn = sin(a);
  p.xz = vec2(cs * p.x - sn * p.z, sn * p.x + cs * p.z);

  float span = 70.0;
  float rise = mod(p.y + t * (2.2 + aSeed * 4.5) + span * 0.5, span) - span * 0.5;
  p.y = mix(p.y, rise, uForge);
  p.x += uForge * sin(t * 1.3 + aSeed * 21.0) * 0.9;

  vec3 tail = mix(aDir, vec3(0.0, -1.0, 0.0), uForge * 0.92);
  tail = mix(tail, aDir, uWarp);
  float len = 0.3 + uForge * 1.5 + uWarp * 18.0;
  p += tail * aEnd * len;

  float edgeF = 1.0 - smoothstep(span * 0.35, span * 0.5, abs(rise));

  vTw = 0.55 + 0.45 * sin(t * (1.6 + aSeed * 3.2) + aSeed * 40.0);
  vFade = (1.0 - aEnd * 0.9) * (0.26 + uWarp * 0.74 + uForge * 0.3) * mix(1.0, edgeF, uForge);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const STREAK_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vFade;
varying float vTw;
void main() {
  gl_FragColor = vec4(uColor * (0.75 + vTw * 0.5), vFade * vTw);
}
`;

/* ============================================================ */

const PALETTES = {
  1: {
    a: new THREE.Color(0x9ae02f),
    b: new THREE.Color(0x0b7f5c),
    ring: new THREE.Color(0x84cc16),
    streak: new THREE.Color(0xa3e635),
    w: [1, 0, 0] as const,
    spin: 0.0042,
    scale: 1.0,
  },
  2: {
    a: new THREE.Color(0x00e5ff),
    b: new THREE.Color(0x4338ca),
    ring: new THREE.Color(0x38bdf8),
    streak: new THREE.Color(0x67e8f9),
    w: [0, 1, 0] as const,
    spin: 0.0098,
    scale: 1.14,
  },
  3: {
    a: new THREE.Color(0xffb020),
    b: new THREE.Color(0xc026d3),
    ring: new THREE.Color(0xf59e0b),
    streak: new THREE.Color(0xfcd34d),
    w: [0, 0, 1] as const,
    spin: 0.006,
    scale: 1.26,
  },
};

type U = { value: number };

const approach = (u: U, target: number, k: number) => {
  const d = target - u.value;
  u.value = Math.abs(d) < 0.003 ? target : u.value + d * k;
  return Math.abs(d);
};

export default function NebulaCanvas({ step, warpRef, tier, onReady, onFail }: NebulaProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<1 | 2 | 3>(step);
  const readyRef = useRef(onReady);
  const failRef = useRef(onFail);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    readyRef.current = onReady;
    failRef.current = onFail;
  }, [onReady, onFail]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const cfg = TIERS[tier];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let dprIndex = 0;
    let nebK: number = cfg.nebK;
    let stride = 1;
    let fpsCap: number = cfg.fps;
    const timeScale = reduced ? 0.3 : 1;

    /* ---------- Renderer ---------- */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      });
    } catch {
      failRef.current();
      return;
    }
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const rt = new THREE.WebGLRenderTarget(2, 2, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });

    const quadCam = new THREE.Camera();
    const quadGeo = new THREE.PlaneGeometry(2, 2);

    /* ---------- Nebula ---------- */
    const nebulaMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: nebulaFrag(cfg.octaves),
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uRes: { value: new THREE.Vector2(2, 2) },
        uTime: { value: 0 },
        uWarp: { value: 0 },
        uW1: { value: 1 },
        uW2: { value: 0 },
        uW3: { value: 0 },
        uA: { value: PALETTES[1].a.clone() },
        uB: { value: PALETTES[1].b.clone() },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
    });
    const nebulaScene = new THREE.Scene();
    const nebulaQuad = new THREE.Mesh(quadGeo, nebulaMat);
    nebulaQuad.frustumCulled = false;
    nebulaScene.add(nebulaQuad);

    /* ---------- Blit ---------- */
    const blitMat = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader: blitFrag(cfg.glow),
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTex: { value: rt.texture },
        uTexel: { value: new THREE.Vector2(0.5, 0.5) },
        uWarp: { value: 0 },
        uTime: { value: 0 },
        uGlow: { value: 0.85 },
      },
    });
    const blitScene = new THREE.Scene();
    const blitQuad = new THREE.Mesh(quadGeo, blitMat);
    blitQuad.frustumCulled = false;
    blitScene.add(blitQuad);

    /* ---------- Scène 3D ---------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
    let baseZ = 28;

    const rig = new THREE.Group();
    scene.add(rig);

    const makeShell = (radius: number, detail: number, opacity: number) => {
      const mat = new THREE.ShaderMaterial({
        vertexShader: SHELL_VERT,
        fragmentShader: SHELL_FRAG,
        wireframe: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uWarp: { value: 0 },
          uW1: { value: 1 },
          uW2: { value: 0 },
          uW3: { value: 0 },
          uA: { value: PALETTES[1].a.clone() },
          uB: { value: PALETTES[1].b.clone() },
          uOpacity: { value: opacity },
        },
      });
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, detail), mat);
      rig.add(mesh);
      return { mesh, mat };
    };

    const shell = makeShell(7.6, cfg.detail, 0.3);
    const core = makeShell(4.0, 1, 0.58);

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: PALETTES[1].ring.clone(),
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(11.4, 0.05, 6, 80), ringMat1);
    ring1.rotation.x = Math.PI / 2.3;
    rig.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: PALETTES[1].b.clone(),
      transparent: true,
      opacity: 0.24,
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(14.6, 0.04, 6, 80), ringMat2);
    ring2.rotation.y = Math.PI / 3.1;
    rig.add(ring2);

    /* ---------- Streaks / embers ---------- */
    const COUNT = reduced ? Math.min(160, cfg.streaks) : cfg.streaks;
    const pos = new Float32Array(COUNT * 6);
    const dir = new Float32Array(COUNT * 6);
    const seed = new Float32Array(COUNT * 2);
    const end = new Float32Array(COUNT * 2);

    for (let i = 0; i < COUNT; i++) {
      const r = 11 + Math.random() * 32;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(ph) * Math.cos(th);
      const y = r * Math.sin(ph) * Math.sin(th);
      const z = r * Math.cos(ph);
      const inv = 1 / r;
      const s = Math.random();

      for (let k = 0; k < 2; k++) {
        const j = i * 2 + k;
        pos[j * 3] = x;
        pos[j * 3 + 1] = y;
        pos[j * 3 + 2] = z;
        dir[j * 3] = x * inv;
        dir[j * 3 + 1] = y * inv;
        dir[j * 3 + 2] = z * inv;
        seed[j] = s;
        end[j] = k;
      }
    }

    const streakGeo = new THREE.BufferGeometry();
    streakGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    streakGeo.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
    streakGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    streakGeo.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));

    const streakMat = new THREE.ShaderMaterial({
      vertexShader: STREAK_VERT,
      fragmentShader: STREAK_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uWarp: { value: 0 },
        uForge: { value: 0 },
        uSwirl: { value: 0 },
        uColor: { value: PALETTES[1].streak.clone() },
      },
    });
    const streaks = new THREE.LineSegments(streakGeo, streakMat);
    streaks.frustumCulled = false;
    scene.add(streaks);

    /* ---------- Sizing ---------- */
    let lastW = 0;
    let lastH = 0;

    const applySize = (force = false) => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      if (!force && coarse && w === lastW && Math.abs(h - lastH) < 160) return;
      lastW = w;
      lastH = h;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, cfg.dpr[dprIndex]));
      renderer.setSize(w, h, false);

      const k = Math.min(nebK, 1700 / w);
      const nw = Math.max(2, Math.floor(w * k));
      const nh = Math.max(2, Math.floor(h * k));
      rt.setSize(nw, nh);
      nebulaMat.uniforms.uRes.value.set(nw, nh);
      blitMat.uniforms.uTexel.value.set(1 / nw, 1 / nh);

      const aspect = w / h;
      camera.aspect = aspect;
      camera.fov = aspect < 1 ? 66 : 60;
      baseZ = aspect < 1 ? 28 + (1 - aspect) * 34 : 28;
      camera.updateProjectionMatrix();
    };

    applySize(true);
    camera.position.z = baseZ;

    /* ---------- Interaction ---------- */
    let mx = 0;
    let my = 0;
    let press = 1;
    let scrollBusy = 0;

    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onDown = () => { press = 1.26; };
    const onUp = () => { press = 1.0; };
    const onScroll = () => { scrollBusy = performance.now() + 180; };

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => applySize());
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    /* ---------- Governor ---------- */
    const gov = { frames: 0, acc: 0, steps: 0 };
    const degrade = () => {
      switch (gov.steps) {
        case 0:
          stride = 2;
          break;
        case 1:
          nebK *= 0.78;
          applySize(true);
          break;
        case 2:
          if (dprIndex < cfg.dpr.length - 1) dprIndex++;
          applySize(true);
          break;
        case 3:
          blitMat.uniforms.uGlow.value = 0;
          break;
        case 4:
          if (fpsCap === 0) fpsCap = 30;
          break;
      }
      gov.steps++;
    };

    /* ---------- Loop ---------- */
    const clock = new THREE.Clock();
    const tmp = new THREE.Vector3();
    let time = 0;
    let frame = 0;
    let lastFrameAt = 0;
    let raf = 0;
    let running = true;
    let readyFired = false;

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        clock.getDelta();
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      failRef.current();
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);

    function tick(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(tick);

      if (fpsCap > 0) {
        if (now - lastFrameAt < 1000 / fpsCap - 1.5) return;
        lastFrameAt = now;
      }

      const dt = Math.min(clock.getDelta(), 0.1);
      time += dt * timeScale;
      frame++;

      const t = time;
      const p = PALETTES[stepRef.current];
      const warp = warpRef.current;

      // --- governor ---
      if (gov.steps < 5 && dt < 0.1) {
        gov.frames++;
        gov.acc += dt;
        if (gov.frames >= 90) {
          const budget = fpsCap > 0 ? 1 / (fpsCap * 0.85) : 1 / 50;
          if (gov.acc / gov.frames > budget) degrade();
          gov.frames = 0;
          gov.acc = 0;
        }
      }

      // --- nebula ---
      const nu = nebulaMat.uniforms;
      nu.uTime.value = t;
      nu.uWarp.value = warp;
      const moving =
        approach(nu.uW1, p.w[0], 0.065) +
        approach(nu.uW2, p.w[1], 0.065) +
        approach(nu.uW3, p.w[2], 0.065);
      (nu.uA.value as THREE.Color).lerp(p.a, 0.055);
      (nu.uB.value as THREE.Color).lerp(p.b, 0.055);
      const mv = nu.uMouse.value as THREE.Vector2;
      mv.x += (mx - mv.x) * 0.045;
      mv.y += (my - mv.y) * 0.045;

      // --- shells ---
      for (const s of [shell, core]) {
        const u = s.mat.uniforms;
        u.uTime.value = s === core ? t * 1.35 : t;
        u.uWarp.value = warp;
        approach(u.uW1, p.w[0], 0.065);
        approach(u.uW2, p.w[1], 0.065);
        approach(u.uW3, p.w[2], 0.065);
        (u.uA.value as THREE.Color).lerp(p.a, 0.055);
        (u.uB.value as THREE.Color).lerp(p.b, 0.055);
      }

      // --- streaks ---
      const su = streakMat.uniforms;
      su.uTime.value = t;
      su.uWarp.value = warp;
      approach(su.uForge, p.w[2], 0.05);
      su.uSwirl.value += dt * timeScale * 0.35 * nu.uW2.value;
      (su.uColor.value as THREE.Color).lerp(p.streak, 0.055);

      ringMat1.color.lerp(p.ring, 0.055);
      ringMat2.color.lerp(p.b, 0.055);
      ringMat1.opacity = 0.4 + warp * 0.42;
      ringMat2.opacity = 0.24 + warp * 0.42;

      // --- transform ---
      const target = p.scale * press + warp * 0.3;
      tmp.set(target, target, target);
      rig.scale.lerp(tmp, 0.08);

      const fpsScale = fpsCap > 0 ? 60 / fpsCap : 1;
      const spin = (p.spin + warp * 0.08) * timeScale * fpsScale;
      shell.mesh.rotation.x += spin;
      shell.mesh.rotation.y += spin * 1.3;
      core.mesh.rotation.x -= spin * 2.0;
      core.mesh.rotation.z += spin * 1.5;
      ring1.rotation.z += spin * 2.2;
      ring2.rotation.x -= spin * 1.7;

      rig.rotation.y += (mx * 0.6 - rig.rotation.y) * 0.05;
      rig.rotation.x += (-my * 0.6 - rig.rotation.x) * 0.05;

      streaks.rotation.y += spin * 0.3;
      camera.position.z += (baseZ - warp * 7 - camera.position.z) * 0.14;

      blitMat.uniforms.uWarp.value = warp;
      blitMat.uniforms.uTime.value = t;

      // --- draw ---
      renderer.autoClear = true;

      const scrolling = now < scrollBusy;
      const eff = scrolling ? Math.max(stride, 2) : stride;
      const needNebula = !readyFired || eff === 1 || warp > 0.002 || moving > 0.004 || frame % eff === 0;

      if (needNebula) {
        renderer.setRenderTarget(rt);
        renderer.render(nebulaScene, quadCam);
        renderer.setRenderTarget(null);
      }

      renderer.render(blitScene, quadCam);
      renderer.autoClear = false;
      renderer.render(scene, camera);

      if (!readyFired) {
        readyFired = true;
        readyRef.current();
      }
    }

    raf = requestAnimationFrame(tick);

    /* ---------- Cleanup ---------- */
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);

      rt.dispose();
      quadGeo.dispose();
      nebulaMat.dispose();
      blitMat.dispose();
      shell.mesh.geometry.dispose();
      shell.mat.dispose();
      core.mesh.geometry.dispose();
      core.mat.dispose();
      ring1.geometry.dispose();
      ring2.geometry.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      streakGeo.dispose();
      streakMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [warpRef, tier]);

  return <div ref={mountRef} className={styles.canvasHolder} />;
}