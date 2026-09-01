"use client";

/**
 * MagicBento — vendored from React Bits (reactbits.dev) and adapted for this
 * site. Changes from the upstream source, all deliberate:
 *
 *  - The hardcoded six-item `cardData` demo array is gone; cards come in via
 *    the `cards` prop so the content lives in data/profile.js.
 *  - The purple palette (132, 0, 255) is replaced by the site's brand accent,
 *    resolved per theme from the --bento-* tokens in app/globals.css.
 *  - Upstream's `:root` block (which leaked a purple palette and
 *    `color-scheme: light dark` into the whole document) is scoped to
 *    .bento-section in the sibling stylesheet.
 *  - Animations are gated on prefers-reduced-motion as well as viewport width.
 *  - A scroll-in reveal was added to match the rest of the page.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./MagicBento.css";

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
// The dark accent (#4A83FF). app/layout.js server-renders data-theme="dark",
// so seeding the light value here would flash the wrong glow for one frame.
const DEFAULT_GLOW_COLOR = "74, 131, 255";
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x, y, color) => {
  const el = document.createElement("span");
  el.className = "bento-particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

// Writes the pointer position into the card's own custom properties. The
// border glow is pure CSS from there — no tween, which is why it survives
// reduced-motion (it's a position readout, not an animation).
const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

/**
 * Two reasons to run the bento inert: a small/touch screen (particles and a
 * cursor spotlight are pointer affordances a touch user can never trigger,
 * and the DOM churn costs battery), and an explicit OS reduced-motion
 * request. The prefers-reduced-motion block in app/globals.css only collapses
 * CSS durations — GSAP tweens and the imperative particle nodes below are
 * JS-driven and ignore it entirely, so they have to be gated here.
 */
const useShouldDisableAnimations = (disableAnimations) => {
  // `false` is the SSR-safe seed: the server can't know the viewport, so the
  // first client render must match it and correct in the effect.
  const [inert, setInert] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setInert(motionQuery.matches || mobileQuery.matches);

    update();
    motionQuery.addEventListener("change", update);
    mobileQuery.addEventListener("change", update);

    return () => {
      motionQuery.removeEventListener("change", update);
      mobileQuery.removeEventListener("change", update);
    };
  }, []);

  return disableAnimations || inert;
};

/**
 * Resolves the glow colour from the active theme.
 *
 * The effects below interpolate the colour into `rgba(${glow}, 0.4)` strings
 * that GSAP parses, and a CSS var() cannot be used there — `rgba(var(--x), 1)`
 * is invalid CSS and GSAP's colour parser rejects it. So we read the computed
 * value of --bento-glow off <html> and re-read it whenever the theme flips.
 * Same MutationObserver approach as components/HeroSection/HeroSection.jsx.
 */
const useThemeGlow = (glowColor) => {
  const [resolvedGlow, setResolvedGlow] = useState(DEFAULT_GLOW_COLOR);

  useEffect(() => {
    if (glowColor) return; // an explicit prop wins
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const read = () => {
      const raw = getComputedStyle(root)
        .getPropertyValue("--bento-glow")
        .trim();
      // "74 131 255" -> "74, 131, 255", the form rgba() needs.
      if (raw) setResolvedGlow(raw.replace(/\s+/g, ", "));
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [glowColor]);

  return glowColor ?? resolvedGlow;
};

const ParticleCard = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = false,
  clickEffect = false,
  enableMagnetism = false,
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        glowColor
      )
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  // The particle elements bake the glow colour into their inline styles, so a
  // theme flip has to discard them or the next hover spawns stale colours.
  useEffect(() => {
    particlesInitialized.current = false;
    memoizedParticles.current = [];
  }, [glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    // When inert, no listeners are attached at all — cheaper than attaching
    // handlers that immediately return, and it guarantees no stray DOM nodes.
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseMove = (e) => {
      if (!enableTilt && !enableMagnetism) return;

      // clientX/clientY and getBoundingClientRect() are both viewport-relative,
      // so this stays correct under Lenis (which transforms the scroll
      // container rather than moving the viewport). Never mix in pageX/pageY.
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      // gsap.ticker drives Lenis, so a leaked repeat:-1 tween shows up as
      // scroll jank rather than as anything visibly wrong on the card.
      gsap.killTweensOf(element);
      particlesRef.current.forEach((particle) => {
        gsap.killTweensOf(particle);
        particle.parentNode?.removeChild(particle);
      });
      particlesRef.current = [];
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);

  return (
    <div ref={cardRef} className={`${className} bento-particle-container`} style={style}>
      {children}
    </div>
  );
};

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "bento-global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest(".bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll(".bento-card");

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
        cards.forEach((card) => {
          card.style.setProperty("--glow-intensity", "0");
        });
        return;
      }

      const { proximity, fadeDistance } =
        calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(
          card,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius
        );
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll(".bento-card").forEach((card) => {
        card.style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      // React 18 StrictMode double-invokes effects in dev; without this the
      // page ends up with two stacked spotlight elements on <body>.
      if (spotlightRef.current) {
        gsap.killTweensOf(spotlightRef.current);
        spotlightRef.current.parentNode?.removeChild(spotlightRef.current);
        spotlightRef.current = null;
      }
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const MagicBento = ({
  cards = [],
  // Upstream defaults to true, which line-clamps the description until hover.
  // These descriptions are ~20 words in a 2-of-6-track column, so they clamp
  // hard — and hiding the copy behind a hover is bad for scanning and simply
  // unreachable on touch, where the whole component is inert anyway.
  textAutoHide = false,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  // Upstream ships tilt on. It fights legibility on a text-heavy card.
  enableTilt = false,
  glowColor,
  clickEffect = true,
  enableMagnetism = true,
  className = "",
}) => {
  const gridRef = useRef(null);
  const shouldDisableAnimations = useShouldDisableAnimations(disableAnimations);
  const glow = useThemeGlow(glowColor);

  // The reveal lives here rather than in Projects.jsx so the component stays
  // drop-in reusable. Projects.jsx's own reveal selects .pj-row, which these
  // cards deliberately are not.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldDisableAnimations || !gridRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(gridRef.current.querySelectorAll(".bento-card"), {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          once: true,
        },
      });
    }, gridRef.current);

    return () => ctx.revert();
  }, [shouldDisableAnimations]);

  if (!cards.length) return null;

  const cardClassName = [
    "bento-card",
    textAutoHide ? "bento-card--text-autohide" : "",
    enableBorderGlow ? "bento-card--border-glow" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`bento-section ${className}`.trim()}>
      {enableSpotlight && !shouldDisableAnimations && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glow}
        />
      )}

      <div className="bento-card-grid" ref={gridRef}>
        {cards.map((card, i) => {
          const body = (
            <>
              <div className="bento-card__header">
                <span className="bento-card__label">{card.label}</span>
                {/* Decorative ordering cue only — the label and title already
                    carry the meaning, so it's hidden from assistive tech
                    rather than read out as a bare number per card. */}
                <span className="bento-card__index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="bento-card__content">
                <h3 className="bento-card__title">{card.title}</h3>
                <p className="bento-card__description">{card.description}</p>
              </div>
            </>
          );

          if (enableStars && !shouldDisableAnimations) {
            return (
              <ParticleCard
                key={card.title}
                className={cardClassName}
                disableAnimations={shouldDisableAnimations}
                particleCount={particleCount}
                glowColor={glow}
                enableTilt={enableTilt}
                clickEffect={clickEffect}
                enableMagnetism={enableMagnetism}
              >
                {body}
              </ParticleCard>
            );
          }

          return (
            <div key={card.title} className={cardClassName}>
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MagicBento;
