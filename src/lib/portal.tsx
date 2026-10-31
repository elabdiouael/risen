"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Kaymonti l children direct f <body>.
 * Mohim: ay ancêtre 3endo transform/filter kaykessr position:fixed.
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}