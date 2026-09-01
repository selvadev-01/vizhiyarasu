"use client";

import { useEffect, useState } from "react";

/**
 * Gates GSAP work on an OS reduced-motion request.
 *
 * The prefers-reduced-motion block in app/globals.css only collapses CSS
 * durations — GSAP tweens are JS-driven and ignore it entirely, so they have to
 * be gated here. Extracted from Experience.jsx once Projects.jsx needed the
 * same gate for its own tweens.
 */
const usePrefersReducedMotion = () => {
  // `false` is the SSR-safe seed: the server can't know the user's setting, so
  // the first client render must match it and correct in the effect.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
};

export default usePrefersReducedMotion;
