"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DESKTOP_MIN } from "@/components/utils/useDeviceTier";

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Coarse pointer OR a sub-desktop viewport both count as "touch-like"
    // tuning. The width threshold comes from the shared DESKTOP_MIN constant so
    // this agrees with useDeviceTier rather than hard-coding a fourth breakpoint.
    // Re-evaluated on breakpoint crossings rather than frozen at mount.
    const touchQuery = window.matchMedia(
      `(hover: none), (pointer: coarse), (max-width: ${DESKTOP_MIN - 1}px)`
    );

    const lenis = new Lenis({
      duration: touchQuery.matches ? 1.0 : 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      // On touch devices, native scrolling feels best — disable Lenis touch
      // smoothing and let the browser handle inertial scrolling natively.
      smoothTouch: false,
      touchMultiplier: touchQuery.matches ? 1.5 : 0.25,
    });

    // Lenis reads these off its options object each frame, so re-tuning in
    // place avoids tearing down and rebuilding the instance mid-scroll.
    const handleTouchQueryChange = (event) => {
      lenis.options.duration = event.matches ? 1.0 : 1.5;
      lenis.options.touchMultiplier = event.matches ? 1.5 : 0.25;
    };
    touchQuery.addEventListener("change", handleTouchQueryChange);

    // Expose the active Lenis instance globally so other components (e.g. the
    // navbar menu) can request smooth scroll-to-section animations through
    // the same engine that's already running. Falling back to native
    // window.scrollTo would fight Lenis and feel jumpy.
    if (typeof window !== "undefined") {
      window.__lenis = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);

    // Named so cleanup can remove it. An anonymous callback here stays
    // registered on the global ticker after unmount and keeps driving a
    // destroyed Lenis instance on every frame.
    const raf = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);

    gsap.ticker.lagSmoothing(0);

    return () => {
      touchQuery.removeEventListener("change", handleTouchQueryChange);
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      if (typeof window !== "undefined" && window.__lenis === lenis) {
        delete window.__lenis;
      }
    };
  }, []);

  return children;
};

export default SmoothScroll;
