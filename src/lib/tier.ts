"use client";

import { useSyncExternalStore } from "react";

export type Tier = "high" | "mid" | "low";

export interface DeviceProfile {
  tier: Tier;
  webgl: boolean;
  touch: boolean;
  reduced: boolean;
}

type NavExtra = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function detect(): DeviceProfile {
  const nav = navigator as NavExtra;
  const cores = nav.hardwareConcurrency || 4;
  const mem = nav.deviceMemory ?? 4;
  const touch = window.matchMedia("(pointer: coarse)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = nav.connection?.saveData === true;

  let webgl = false;
  let software = false;

  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as
      | WebGLRenderingContext
      | null;

    if (gl) {
      webgl = true;
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const name = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
      software = /swiftshader|llvmpipe|software|basic render/i.test(name);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webgl = false;
  }

  let tier: Tier = "high";
  if (!webgl || software || saveData || cores <= 2 || mem <= 2) tier = "low";
  else if (touch || cores <= 4 || mem <= 4) tier = "mid";

  return { tier, webgl: webgl && !software, touch, reduced };
}

let cached: DeviceProfile | null = null;

const subscribe = () => () => {};

const getSnapshot = (): DeviceProfile => {
  if (!cached) {
    cached = detect();
    const html = document.documentElement;
    html.dataset.tier = cached.tier;
    html.dataset.touch = cached.touch ? "1" : "0";
  }
  return cached;
};

const getServerSnapshot = (): DeviceProfile | null => null;

/** Profil dyal l device — null f SSR, 3amer f l client. */
export function useDeviceProfile(): DeviceProfile | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}