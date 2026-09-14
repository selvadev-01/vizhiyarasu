"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { PROFILE } from "../../data/profile";
import useDeviceTier, { readTierNow, TABLET_MIN } from "../utils/useDeviceTier";
import { getMotionTier } from "../utils/motionTiers";

// Lazy-loaded so `three` (~150kB gz) splits into its own chunk instead of
// blocking first paint. It's a decorative background behind the hero text —
// nothing about the hero's content or layout depends on it, so it can arrive
// a beat late. ssr:false because it's WebGL-only and rendered nothing on the
// server anyway.
const LiquidEther = dynamic(() => import("../LiquidEther/LiquidEther"), {
  ssr: false,
});

// Module-level constants so the array reference stays stable across renders
// (otherwise LiquidEther's useEffect would tear down/rebuild WebGL each render).
// One per theme: the pale blue reads as a soft tint on the light background,
// but glows harshly against the near-black dark surface, so dark mode uses a
// deeper, desaturated blue instead of the same value inverted.
const HERO_LIQUID_COLORS_LIGHT = ["#1B2540"];
const HERO_LIQUID_COLORS_DARK = ["#D9E6FF"];

// Splits `text` into one animatable span per character. A "\n" in the source
// string becomes a real line break rather than a character span \u2014 the hero
// wordmark uses it to stack the first and last name on fixed lines.
const SplitChars = ({ text, className, id }) => {
  return (
    <span className={className} id={id}>
      {text.split("\n").map((line, lineIndex) => (
        <span key={lineIndex} className="hero-line">
          {line.split("").map((char, i) => (
            <span
              key={i}
              className="hero-char"
              style={{ display: "inline-block" }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
};

const HeroSection = () => {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const headingRef = useRef(null);
  const loaderRef = useRef(null);
  const loaderCounterRef = useRef(null);
  const stroke1Ref = useRef(null);
  const stroke2Ref = useRef(null);
  const endLineRef = useRef(null);
  const parallaxInstanceRef = useRef(null);
  const [loaderDone, setLoaderDone] = useState(false);
  // Mirrors `loaderDone` for the mount-once effect below, which would otherwise
  // close over the initial `false` for the life of the component.
  const loaderDoneRef = useRef(false);

  // Track the active theme so the WebGL fluid can use a colour that suits the
  // current background. Starts at 'dark' to match the server-rendered default
  // in app/layout.js, then syncs to whatever the bootstrap script resolved and
  // follows any later toggle via the data-theme attribute.
  const [isDark, setIsDark] = useState(true);

  // Drives the tiered cost of the WebGL fluid below. `fluidInteractive` is true
  // only on desktop; mobile and tablet keep the ambient wash but at roughly half
  // the per-frame GPU cost.
  const deviceTier = useDeviceTier();
  const { fluidInteractive } = getMotionTier(deviceTier);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const read = () => setIsDark(root.dataset.theme !== "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Scroll is locked for the ~5.5s intro. Every release path below funnels
    // through this one function so the lock can never outlive the animation:
    // previously the only release was the timeline's onComplete, which meant a
    // throw anywhere in this effect — or a tab backgrounded long enough for the
    // timeline to be starved — left the page permanently unscrollable.
    const releaseScroll = () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };

    // `position/overflow` on <body> is deliberately NOT used to lock scrolling
    // (that is what created the nested-scroller bug — see globals.css). Locking
    // via overflow on the element that is not the scroller is safe only because
    // it is transient and always released below.
    document.body.style.overflow = "hidden";

    // Hard safety net: whatever happens to the timeline, scrolling comes back.
    // 9s is comfortably past the 5.5s intro, so it only ever fires on failure.
    const failsafe = window.setTimeout(releaseScroll, 9000);

    // A bailout also has to release the lock, so the page is merely un-animated
    // rather than frozen if the hero markup is not where we expect it.
    if (!headingRef.current) {
      releaseScroll();
      window.clearTimeout(failsafe);
      return;
    }

    const headingChars = headingRef.current.querySelectorAll(".hero-char");

    // Hide hero elements initially
    gsap.set(headingChars, { autoAlpha: 0, y: 100 });
    gsap.set(imgRef.current, { autoAlpha: 0, y: "50%", scale: 0.8 });
    gsap.set([stroke1Ref.current, stroke2Ref.current], { autoAlpha: 0, width: "0%" });
    gsap.set(endLineRef.current, { autoAlpha: 0 });

    // Breaker line: invisible at the top of the page, fades in as the user
    // scrolls down. Tied to scroll position via scrub so it tracks Lenis
    // smooth-scroll precisely.
    const endLineTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=300",
      scrub: true,
      animation: gsap.to(endLineRef.current, { autoAlpha: 1, ease: "none" }),
    });

    // iOS 13+ requires explicit permission to receive deviceorientation events.
    // parallax-js uses those events automatically on mobile (gyroscope mode),
    // so we ask for permission on the first user gesture.
    const requestGyroPermission = () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        DeviceOrientationEvent.requestPermission().catch(() => {});
      }
    };
    const handleFirstGesture = () => {
      requestGyroPermission();
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("click", handleFirstGesture);
    };
    window.addEventListener("touchstart", handleFirstGesture, { once: true, passive: true });
    window.addEventListener("click", handleFirstGesture, { once: true });

    // Initialize wagerfield/parallax (parallax-js) after the GSAP reveal.
    //
    // Desktop only, per the shared motion budget: the effect tracks a cursor,
    // which a coarse pointer does not have. Previously this ran everywhere and
    // fell back to gyroscope input, which meant phones paid for the library
    // download plus continuous devicemotion work for an effect that mostly
    // reads as drift. The dynamic import is inside the guard so the bundle is
    // never even fetched on mobile and tablet.
    const initParallax = async () => {
      if (typeof window === "undefined" || !sectionRef.current) return;
      if (!getMotionTier(readTierNow()).parallax) return;
      try {
        const mod = await import("parallax-js");
        const Parallax = mod.default || mod;
        if (!sectionRef.current) return;
        parallaxInstanceRef.current = new Parallax(sectionRef.current, {
          relativeInput: true,
          hoverOnly: true,
          selector: ".hero-layer",
          scalarX: 2,
          scalarY: 2,
          frictionX: 0.1,
          frictionY: 0.1,
        });
      } catch (err) {
        console.error("Failed to init parallax-js:", err);
      }
    };

    // Pick stroke widths based on viewport so the strokes don't dwarf the hero
    // on phones. The widths stay in `vw` so they keep tracking the viewport,
    // but the mobile/desktop *ratio* is chosen here at build time — so crossing
    // the 768px breakpoint (a rotate, or resizing a desktop window) has to
    // re-apply it, otherwise the hero keeps the ratio it loaded with.
    const strokeQuery = window.matchMedia(`(max-width: ${TABLET_MIN}px)`);
    const strokeWidthsFor = (matches) => ({
      stroke1: matches ? "40vw" : "22vw",
      stroke2: matches ? "30vw" : "16vw",
    });
    const { stroke1: stroke1Width, stroke2: stroke2Width } = strokeWidthsFor(
      strokeQuery.matches
    );

    // Only re-applied once the intro timeline has finished; while it is still
    // running the tweens below own these properties and would fight this write.
    const handleStrokeQueryChange = (event) => {
      if (!loaderDoneRef.current) return;
      const next = strokeWidthsFor(event.matches);
      if (stroke1Ref.current) {
        gsap.set(stroke1Ref.current, { width: next.stroke1 });
      }
      if (stroke2Ref.current) {
        gsap.set(stroke2Ref.current, { width: next.stroke2 });
      }
    };
    strokeQuery.addEventListener("change", handleStrokeQueryChange);

    const tl = gsap.timeline({
      onComplete: () => {
        loaderDoneRef.current = true;
        setLoaderDone(true);
        window.clearTimeout(failsafe);
        releaseScroll();
        initParallax();
      },
    });

    const counter = { value: 0 };

    // Loader counter: 0 → 100
    tl.to(counter, {
      value: 100,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        if (loaderCounterRef.current) {
          loaderCounterRef.current.innerText = `${Math.floor(counter.value)}`;
        }
      },
    }, "anim");

    // Loader slide up
    tl.to(loaderRef.current, {
      y: "-100%",
      duration: 1.8,
      ease: "power3.out",
    }, "anim+=2.2");

    // Counter fade out
    tl.to(loaderCounterRef.current, {
      autoAlpha: 0,
      duration: 1,
      ease: "power2.out",
    }, "anim+=2");

    // Heading chars animation
    tl.to(headingChars, {
      autoAlpha: 1,
      y: 0,
      stagger: {
        amount: 0.5,
        from: "start",
      },
      duration: 1,
      ease: "power3.out",
    }, "anim+=3.2");

    // Image animation
    tl.to(imgRef.current, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: "sine.out",
    }, "anim+=4.2");

    // Stroke 2 animation (right side, slightly earlier)
    tl.to(stroke2Ref.current, {
      autoAlpha: 1,
      width: stroke2Width,
      duration: 1,
      ease: "power2.out",
    }, "anim+=4.3");

    // Stroke 1 animation (left side)
    tl.to(stroke1Ref.current, {
      autoAlpha: 1,
      width: stroke1Width,
      duration: 1,
      ease: "power2.out",
    }, "anim+=4.5");

    return () => {
      tl.kill();
      endLineTrigger.kill();
      if (parallaxInstanceRef.current) {
        try {
          parallaxInstanceRef.current.destroy();
        } catch (e) {}
        parallaxInstanceRef.current = null;
      }
      strokeQuery.removeEventListener("change", handleStrokeQueryChange);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("click", handleFirstGesture);
      window.clearTimeout(failsafe);
      releaseScroll();
    };
  }, []);

  return (
    <>
      {/* Loader */}
      <div id="loader" ref={loaderRef}>
        <div id="loader-counter" ref={loaderCounterRef}>0</div>
      </div>

      {/* Hero — direct children of #hero-section are parallax layers.
          Each layer's `data-depth` controls how much it moves with the cursor. */}
      <div id="hero-section" ref={sectionRef}>
        {/* Animated fluid background. Not a `.hero-layer` so parallax-js skips it. */}
        <div id="hero-bg-fluid">
          <LiquidEther
            colors={isDark ? HERO_LIQUID_COLORS_DARK : HERO_LIQUID_COLORS_LIGHT}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            // The Poisson solve is the sim's dominant per-frame cost — each
            // iteration is a full-screen GPU pass. 16 is visually
            // indistinguishable here because the result is a diffuse blur,
            // so the extra 16 passes were pure overhead.
            //
            // Halved again off-desktop: the sim is a diffuse background wash, so
            // the drop is hard to see, but it is the single most expensive thing
            // on the page and phones render it on a much tighter GPU and power
            // budget. Same reasoning for the lower simulation resolution.
            iterationsPoisson={fluidInteractive ? 16 : 8}
            resolution={fluidInteractive ? 0.4 : 0.25}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>

        {/* Back stroke (behind heading) */}
        <div className="hero-layer" data-depth="0.20" style={{ zIndex: 4 }}>
          <div id="hero-stroke-2" ref={stroke2Ref}>
            <img src="/Svg_Stroke.png" alt="" draggable="false" />
          </div>
        </div>

        {/* Heading text (deepest, moves least) */}
        <div className="hero-layer" data-depth="0.10" style={{ zIndex: 5 }}>
          <div id="hero-heading" ref={headingRef}>
            <SplitChars text={PROFILE.heroName} />
            {/* Job role in full, set small and flush to the right edge of
                the wordmark. Broken onto fixed lines so the wrap points are
                deliberate instead of dependent on the type scale. Shares the
                heading's reveal animation via `.hero-char`, so it staggers in
                with the last name. */}
            <span id="hero-role">
              <SplitChars text={PROFILE.heroTitle} />
            </span>
          </div>
        </div>

        {/* Portrait image (foreground, moves more) */}
        <div className="hero-layer" data-depth="0.50" style={{ zIndex: 10 }}>
          {/* TODO: /Portfolio_Img-4.png is still the previous site owner's
              portrait — replace the file in public/ with one of Vizhiyarasu. */}
          <div id="hero-img" ref={imgRef}>
            <img src="/Portfolio_Img-4.png" alt="" draggable="false" />
          </div>
        </div>

        {/* Front stroke (top-most) */}
        <div className="hero-layer" data-depth="0.30" style={{ zIndex: 11 }}>
          <div id="hero-stroke-1" ref={stroke1Ref}>
            <img src="/Svg_Stroke.png" alt="" draggable="false" />
          </div>
        </div>

        {/* End-of-hero indicator line */}
        <div className="hero-end-line" ref={endLineRef}></div>
      </div>
    </>
  );
};

export default HeroSection;
