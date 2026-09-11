"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { readTierNow } from "./useDeviceTier";
import { getMotionTier, EASE_OUT_GSAP } from "./motionTiers";

/**
 * Shared scroll-reveal for the page's list sections (projects, education,
 * experience, achievements).
 *
 * Two things this centralises:
 *
 * 1. `toggleActions`. The previous per-component setting was
 *    "play reverse play reverse", which reverses the reveal when the trigger
 *    leaves the top of the viewport. Every project and education row was left
 *    at opacity 0 once scrolled past, so the lists read as blank on the way
 *    back up. Revealing content should play once and stay played; "play none
 *    none none" is the correct action set for an entrance.
 *
 * 2. Tier-aware values. Duration, travel distance and stagger now come from
 *    the shared motion budget instead of one desktop-tuned constant, so a
 *    phone gets a shorter, tighter, more sequential reveal rather than the
 *    same 60px drop tuned for a 1440px screen.
 *
 * @param {object} opts
 * @param {React.RefObject} opts.scopeRef  Element to scope the gsap.context to.
 * @param {boolean} opts.reducedMotion     Skip all tweens when true.
 * @param {(reveal: Function, tier: object) => void} opts.build
 *        Receives a `reveal(target, vars)` helper and the resolved tier config.
 */
const useScrollReveal = ({ scopeRef, reducedMotion, build }) => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // No tween means nothing to reset: the markup stays at its final state.
    if (reducedMotion) return;
    if (!scopeRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const tier = getMotionTier(readTierNow());

    const ctx = gsap.context(() => {
      const reveal = (el, vars) => {
        if (!el || (el.length === 0 && !el.tagName)) return;
        // `trigger` defaults to the animated element, which is right for a
        // per-row reveal. Pass an explicit trigger when one tween covers a
        // whole group (a staggered cascade needs the container as its trigger,
        // not its first child).
        const { trigger, ...rest } = vars;
        return gsap.from(el, {
          ease: EASE_OUT_GSAP,
          ...rest,
          scrollTrigger: {
            trigger: trigger || el,
            // Slightly later on a phone: `top 88%` fires while the row is still
            // well below the fold on a tall narrow viewport, so the reveal was
            // finishing before the row was actually look-at-able.
            start: tier.revealStart,
            // Entrance, not a toggle. See the note above.
            toggleActions: "play none none none",
          },
        });
      };

      build(reveal, tier);
    }, scopeRef.current);

    return () => ctx.revert();
  }, [reducedMotion, scopeRef, build]);
};

export default useScrollReveal;
