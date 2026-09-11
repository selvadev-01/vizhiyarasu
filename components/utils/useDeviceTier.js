"use client";

import { useEffect, useState } from "react";

/**
 * The single source of truth for "which device class is this?".
 *
 * Before this hook, four components each decided independently: HeroSection
 * used `pointer: coarse || < 1024px` (plus a separate 768px query for stroke
 * widths), SmoothScroll used `coarse || < 1023px`, MagicBento used 768px, and
 * GradualBlur used 480/768/1024. Those disagree with each other at several
 * common widths, so the same device could be "mobile" to one component and
 * "desktop" to another.
 *
 * Width alone is not enough: an 834px iPad reports `pointer: coarse`, and a
 * desktop browser resized narrow does not. Tier is therefore pointer-type FIRST,
 * width second — a coarse pointer is never treated as desktop, however wide it
 * gets, because hover and cursor-tracking effects have nothing to track.
 *
 * Tiers:
 *   "mobile"  - coarse pointer under TABLET_MIN, or any viewport under it
 *   "tablet"  - coarse pointer at TABLET_MIN and up, or fine pointer below DESKTOP_MIN
 *   "desktop" - fine pointer (mouse/trackpad) at DESKTOP_MIN and up
 */

export const TABLET_MIN = 768;
export const DESKTOP_MIN = 1024;

// Matches the SSR seed below. Rendering desktop-first on the server keeps the
// markup stable for the most common visitor and avoids a mobile-to-desktop
// flash; the effect corrects it before paint on everything else.
const SSR_TIER = "desktop";

/**
 * Non-hook tier read, for imperative code (GSAP effects, event handlers) that
 * needs the current tier outside the React render cycle. Browser-only.
 */
export const readTierNow = () => {
  const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const width = window.innerWidth;

  if (coarse) return width >= TABLET_MIN ? "tablet" : "mobile";
  if (width < TABLET_MIN) return "mobile";
  if (width < DESKTOP_MIN) return "tablet";
  return "desktop";
};

const useDeviceTier = () => {
  const [tier, setTier] = useState(SSR_TIER);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setTier(readTierNow());
    update();

    // Listening to the two boundary queries rather than every resize event:
    // this fires only when a threshold is actually crossed, so dragging a
    // window across 40px of width does not re-render the tree 40 times.
    const queries = [
      window.matchMedia(`(min-width: ${TABLET_MIN}px)`),
      window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`),
      window.matchMedia("(hover: none), (pointer: coarse)"),
      // Rotating a tablet swaps width and height without necessarily crossing
      // a min-width boundary in the direction the others watch.
      window.matchMedia("(orientation: portrait)"),
    ];

    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);

  return tier;
};

export default useDeviceTier;
