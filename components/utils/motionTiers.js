/**
 * Motion budget per device tier.
 *
 * One system, three intensity levels — not three separate motion designs. Every
 * component reads the same tokens, so "what moves on a tablet" is answered in
 * one place instead of being re-litigated per component.
 *
 * The progression is deliberate:
 *   desktop - full choreography. A mouse can hover, so cursor-tracked effects
 *             (parallax, magnetic buttons, spotlight) have something to track.
 *   tablet  - scroll reveals kept, cursor-driven effects dropped (no hover),
 *             durations shortened slightly so the page feels responsive to touch.
 *   mobile  - transform/opacity fades only. No parallax, no pinning, no WebGL
 *             interaction: these are the most battery- and GPU-expensive
 *             effects on exactly the hardware least able to afford them.
 *
 * `prefers-reduced-motion` is handled separately by usePrefersReducedMotion and
 * overrides all of this — it is an accessibility requirement, not a tier.
 */

export const MOTION_TIERS = {
  desktop: {
    // Scroll-linked reveal
    revealDuration: 1,
    revealStagger: 0.06,
    revealDistance: 40,
    // How far a row's characters travel, and how tightly they follow each
    // other. On a phone the eye covers a much shorter line, so the same
    // per-character delay that reads as a crisp cascade on a wide screen reads
    // as a slow typewriter instead.
    charStagger: 0.012,
    revealStart: "top 88%",
    // A slight horizontal drift gives a phone reveal direction rather than a
    // flat fade. Zero on desktop, where vertical travel already reads clearly
    // across a wide row.
    slideX: 0,
    // Scale on entry. Subtle on desktop, a little more on mobile where it
    // substitutes for the parallax depth cue that touch devices do not get.
    scaleFrom: 1,
    // Cursor-driven effects
    parallax: true,
    cursorEffects: true,
    // Scroll hijacking / pinning
    pinning: true,
    // Decorative WebGL and per-frame simulation
    fluidInteractive: true,
  },
  tablet: {
    revealDuration: 0.8,
    revealStagger: 0.05,
    revealDistance: 28,
    charStagger: 0.016,
    slideX: 12,
    scaleFrom: 0.985,
    revealStart: "top 85%",
    // A coarse pointer cannot hover, so these would never fire.
    parallax: false,
    cursorEffects: false,
    // Pinning fights native touch-scroll momentum and feels sticky.
    pinning: false,
    fluidInteractive: false,
  },
  mobile: {
    // Shorter and closer than desktop on purpose. A phone scrolls faster
    // relative to content height, so a 1s reveal is still mid-flight when the
    // row is already centred; 0.55s lands it as the row settles.
    revealDuration: 0.55,
    // Wider than desktop: rows arrive one at a time on a narrow screen, so a
    // visible gap between them reads as sequence. At desktop's 0.06 the four
    // project rows fired as one block (measured: all three at y=31.98).
    revealStagger: 0.1,
    // Shorter travel. 60px on an 812px-tall viewport is ~7% of the screen and
    // reads as a lurch; 22px reads as a lift.
    revealDistance: 22,
    charStagger: 0.02,
    slideX: 18,
    scaleFrom: 0.97,
    // Later than desktop: on a tall narrow viewport `top 88%` sits far below
    // the fold, so the reveal finished before the row was worth looking at.
    revealStart: "top 78%",
    parallax: false,
    cursorEffects: false,
    pinning: false,
    fluidInteractive: false,
  },
};

// Matches the cubic-bezier already used across globals.css, so JS-driven and
// CSS-driven motion on the same page share one easing curve.
export const EASE_OUT = [0.16, 1, 0.3, 1];

// The same curve for GSAP, which takes an easing string rather than an array.
// Kept beside EASE_OUT so the two cannot drift apart.
export const EASE_OUT_GSAP = "cubic-bezier(0.16, 1, 0.3, 1)";

export const getMotionTier = (tier) => MOTION_TIERS[tier] || MOTION_TIERS.desktop;
